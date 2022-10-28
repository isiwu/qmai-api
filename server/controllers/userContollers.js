import bcrypt from "bcrypt";
import nodeMailer from "nodemailer";
import ATP from "../models/atp";
import Member from "../models/member";
//import Member from "../models/member";
import Profile from "../models/profile";
import User from "../models/user";
import VerifyEmail from "../models/verify-email";


const getData = (req) => {
  const {firstName, lastName, email, phone, password, atp} = req.body;
  const salt = bcrypt.genSaltSync(16);
  const hash = bcrypt.hashSync(password, salt);

  if (email === "isiwuemma.o@gmail.com") {
    return {
      name: {
        first: firstName,
        last: lastName,
      },
      email: email,
      phone: phone,
      password: hash,
      role: "admin",
    };
  }

  if (atp) {
    return {
      email: email,
      phone: phone,
      password: hash,
      role: "atp",
    };
  }

  return {
    name: {
      first: firstName,
      last: lastName,
    },
    email: email,
    phone: phone,
    password: hash,
  };
};

const mailTransporter = () => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    secure: true,
    disableFileAccess: true,
    auth: {
      user: "Chlpscanada2022@gmail.com", // generated ethereal user
      pass: "klngwpwspctrhdxf", // generated ethereal password
    },
  });

  return transporter;

};
const getEmailCode = async (length) => {
  let randomUniqueCode, codeExists;

  //ENSURE LENGTH
  // eslint-disable-next-line no-constant-condition
  while (true) {
    randomUniqueCode = Math.floor(Math.random() * Date.now()).toString();

    if (randomUniqueCode.length >= length) break;
  }

  const uniqueCode = Number(randomUniqueCode.slice(0, length));

  //ENSURE CODE UNIQUENESS
  try {
    codeExists = await VerifyEmail.exists({code: uniqueCode});
  } catch (error) {
    console.log(`Error fetching user info in genUniqueCode controller due to: ${error.message}`);
  }

  if (codeExists) getEmailCode(length);
  else return uniqueCode;
};
const deleteUserById = async (id) => {
  try {
    await User.findByIdAndDelete(id);
  } catch (error) {
    console.log(`Error deleting user from db due to: ${error.message}`);
  }
};
const signup = async (req, res, next) => {
  //Get user data
  const userData = getData(req);
  let user, atp = {};

  try {
    const emailExist = await User.exists({email: req.body.email});

    if (emailExist) {
      res.locals.status = 400;
      res.locals.data = "Unable to create user due to already existing email";
      
      return next();
    }
  } catch (error) {
    console.log(`Error in checking email existence due to: ${error.message}`);
    // res.locals.status = 500;
    // res.locals.data = error.message;
    return next(error);
  }

  try {
    user = await User.create(userData);
  } catch (error) {
    console.log(`Error registering new user due to: ${error.message}`);
    return next(error);
  }

  if (user.role === "admin") return next();
  if (user.role === "atp") {
    const { name, contact, address, city, country, postalCode, interest, otherInfo} = req.body;

    if (!contact || !address || !city || !country || !postalCode || !interest || !otherInfo) {
      await User.findByIdAndDelete(user.id).exec();

      res.locals.status = 400;
      res.locals.data = "Incorrect input request";

      return next();
    }

    try {
      atp = await ATP.create({
        _id: user.id,
        name,
        contact,
        address,
        city,
        country,
        postalCode,
        interest,
        otherInfo,
      });
    } catch (error) {
      console.log(`Error in creating ATP due to: ${error.message}`);
      return next(error);
    }
  }

  //Generate unique email verification code
  let code;
  try {
    code = await getEmailCode(4);
  } catch (error) {
    console.log(`Error in generating the email verification code due to: ${error.message}`);
    await deleteUserById(user.id);

    return next(error);
  }

  try {
    await VerifyEmail.create({_id: user.id, code});
  } catch (error) {
    console.log(`Error saving the email code to db due to: ${error.message}`);
  }

  const mailMessage = `<!doctype html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                clifford: '#da373d',
                qmaiBackground: "linear-gradient(180deg, #3CCE2A 0%, #006A04 100%)"
              },
              backgroundImage: {
                qmaiBackgroundGreen : "linear-gradient(180deg, #3CCE2A 0%, #006A04 100%)",
                qmaiTextGreen: "linear-gradient(180deg, #11C75A 0%, #50D013 100%)",
              }
            }
          }
        }
      </script>
    </head>
    <body class="text-3xl bg-qmaiBackgroundGreen bg-no-repeat">
      <div class="w-[50%] mx-auto my-14 bg-white p-10 rounded-lg">
        <h1 class="text-3xl text-green-600 font-bold">Hi,</h1>
        <div class="">
          <p class="my-5 font-light text-lg">Your recieved this mail because you or somebody signup with this email account on QMAI website. Please, we need to verify this email before your signup ${user.role === "atp" && "as an ATP"} can be completed!</p>
          <p class="mb-8 font-bold text-base text-green-400">If you did not initiate this or remember one doing this using your email account, kindly ignore.</p>
          <p class="font-extrabold text-base">Verification Code: <span>${code}</span></p>
        </div>
      </div>
    </body>
  </html>`;

  let mailSuccess = true;
  const mail = {
    from: "support@achlps.com",
    to: req.body.email,
    subject: "QMAI SIGNUP VERIFICATION.",
    html: mailMessage
  };
  
  try {
    const transporter = mailTransporter();
    await transporter.sendMail(mail);
  } catch (error) {
    console.log(`Error sending mail to user due to: ${error.message}`);
    //console.log(error.message);
    mailSuccess = false;
  }

  if (!mailSuccess) {
    try {
      await deleteUserById(user.id);
      
      res.locals.status = 500;
      res.locals.data = "Unable to mail user.";
    } catch (error) {
      console.log(`Error deleting the user due to: ${error.message}`);

      // res.locals.status = 500;
      // res.locals.data = `Error deleting the user due to: ${error.message}`;

      return next(error);
    }
  }

  if (user.role === "atp") res.locals.data = {
    ...atp.toObject(),
    email: user.email,
    phone: user.phone,
    role: user.role,
  }; 
  else res.locals.data = user;

  res.locals.status = 200;

  next();
};
const checkEmail = async (req, res, next) => {
  if (!req.body.email) {
    res.locals.status = 400;
    res.locals.data = true;

    return next();
  }

  try {
    if (await User.exists({email: req.body.email})) {
      res.locals.status = 200;
      res.locals.data = true;
      return next();
    }

    res.locals.status = 200;
    res.locals.data = false;
    next();
  } catch (error) {
    console.log(`Error checking whether the email exist due to: ${error.message}`);

    return next(error);
  }
};
const verifyEmail = async (req, res, next) => {
  let user, verifiedEmail;

  if (!req.body.code) {
    res.locals.status = 400;
    res.locals.data = "Incorrect verification code!";

    return next();
  }

  try {
    verifiedEmail = await VerifyEmail.findOne({code: req.body.code});
  } catch (error) {
    console.log(`Error verifing email the given code due to: ${error.message}`);
    return next(error);
  }

  if (!verifiedEmail) {
    res.locals.status = "400";
    res.locals.data = "Verification code does exist!";

    return next();
  }

  try {
    user = await User.findById(verifiedEmail.id);
  } catch (error) {
    console.log(`Error fetching user to know his verification status due to: ${error.message}`);
    return next(error);
  }

  if (!user) {
    res.locals.status = "400";
    res.locals.data = "User does not exist!";

    return next();
  }

  try {
    user = await User.findByIdAndUpdate(verifiedEmail.id, {
      $set: {
        verified: true,
      }
    });
  } catch (error) {
    console.log(`Error updating the user verification status due to: ${error.message}`);
    return next(error);
  }

  try {
    await VerifyEmail.findByIdAndDelete(user.id);
  } catch (error) {
    console.log(`Error deleting the verified user code from verify email model due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = user;

  next();
};
const login = async (req, res, next) => {
  const {email, password} = req.body;
  let user;

  try {
    user = await User.findOne({email});
  } catch (error) {
    console.log(`Error fetching information for the incoming user due to: ${error.message}`);
    return next(error);
  }

  //Check user exists
  if (!user) {
    res.locals.status = 400;
    res.locals.data = "username or password incorrect!";

    return next();
  }

  try {
    if (!bcrypt.compareSync(password, user.password)) {
      res.locals.status = 400;
      res.locals.data = "username or password incorrect!";

      return next();
    } 
  } catch (error) {
    console.log(`Error in password comparison: ${error.message}`);
    return next(error);
  }

  if (user.role === "user") {
    try {
      user = await User.findOne({email}, "-password").populate("profileId");

    } catch (error) {
      console.log(`Error in getting user info due to: ${error.message}`);
      return next(error);
    }
  
    let userMembershipData;
    if (user?.profileId?.applicationApproved) {
      try {
        userMembershipData = await Member.findById(user.id);
      } catch (error) {
        console.log(`Error in getting user info due to: ${error.message}`);
      }
    }
  
    res.locals.status = 200;
    res.locals.data = {
      ...user.toObject(),
      membershipType: userMembershipData?.type??""
    };
  } else if (user.role === "atp") {
    let atp;

    try {
      user = await User.findOne({email}, "-password").exec();
    } catch (error) {
      console.log(`Error in getting user info due to: ${error.message}`);
      return next(error);
    }

    try {
      atp = await ATP.findById(user?.id).exec();
    } catch (error) {
      console.log(`Error in fetching the ATP data due to: ${error.message}`);
      return next(error);
    }

    res.locals.status = 200;
    res.locals.data = {
      ...atp.toObject(),
      ...user.toObject(),
    };
  } else {
    try {
      user = await User.findOne({email}, "-password").exec();
    } catch (error) {
      console.log(`Error in getting user info due to: ${error.message}`);
      return next(error);
    }
    res.locals.status = 200;
    res.locals.data = user;
  }

  next();
};
const users = async (req, res, next) => {
  const users = await User.find({});

  res.locals.status = 200;
  res.locals.data = users;

  next();
};
const getUser = async (req, res, next) => {
  let user;

  try {
    user = await User.findById(req.params.id).populate("profileId");
  } catch (error) {
    console.log(`Error getting user information from store due to: ${error.message}`);
    return next(error);
  }

  let userMembershipData;
  if (user?.profileId?.applicationApproved) {
    try {
      userMembershipData = await Member.findById(user.id);
    } catch (error) {
      console.log(`Error in getting user info due to: ${error.message}`);
    }
  }

  res.locals.status = 200;
  res.locals.data = {
    ...user.toObject(),
    membershipType: userMembershipData?.type??""
  };


  // res.locals.status = 200;
  // res.locals.data = user;

  next();
};
const updateProfile = async (req, res, next) => {
  const {id} = req.params;
  let { dateOfBirth, academics, workExps} = req.body;
  let avatar = req.avatar;
  academics = academics?.length && JSON.parse(academics);
  workExps = workExps?.length && JSON.parse(workExps);
  let profile,user;

  if (academics?.length) {
    academics = academics.filter((academic) => {
      let empty = false;
      for (const key in academic) {
        if (Object.hasOwnProperty.call(academic, key)) {
          if (!academic[key]) {
            empty = true;
            break;
          }
        }
      }

      if (!empty) return true;
      return false;
    });
  }

  if (workExps?.length) {
    workExps = workExps.filter((workExp) => {
      let empty = false;
      for (const key in workExp) {
        if (Object.hasOwnProperty.call(workExp, key)) {
          if (!workExp[key]) {
            empty = true;
            break;
          }
        }
      }

      if (!empty) return true;
      return false;
    });
  }

  try {
    user = await User.findById(id).populate("profileId");
  } catch (error) {
    console.log(`Error getting the user data by id due to: ${error.message}`);
    return next(error);
  }

  if (!user) {
    res.locals.status = 400;
    res.locals.data = "user account does not exist! Please signup to continue.";
    console.log(`User with email account ${user?.email} does not exist.`);
    return next();
  }

  try {
    if (await Profile.exists({_id: user.profileId})) {
      if (dateOfBirth) {
        profile = await Profile.findByIdAndUpdate(user.profileId, {
          $set: {dateOfBirth}
        });
      } 

      if (academics?.length ) {
        profile = await Profile.findByIdAndUpdate(user.profileId, {
          $addToSet: {academics: {$each: academics}}
        });
      } 

      if (workExps?.length) {
        profile = await Profile.findByIdAndUpdate(user.profileId, {
          $addToSet: {workExps: {$each: workExps}}
        });
      } 

      if (avatar) {
        profile = await Profile.findByIdAndUpdate(user.profileId, {
          $set: {avatar}
        });
      }

      if (profile?.dateOfBirth && profile?.academics?.length && profile?.workExps?.length && profile?.avatar) {
        profile = await Profile.findByIdAndUpdate(user.profileId, {
          $set: {
            profileCompleted: true,
          }
        });
      }
    } else {
      const profileData = {};
      if (dateOfBirth) profileData.dateOfBirth = dateOfBirth;
      if (academics?.length) profileData.academics = academics;
      if (workExps?.length) profileData.workExps = workExps;
      if (avatar) profileData.avatar = avatar;

      profile = await Profile.create(profileData);

      await User.findByIdAndUpdate(id, {
        $set: {
          profileId: profile.id,
        }
      });
    }

    if (profile?.dateOfBirth && profile?.academics?.length && profile?.workExps?.length && profile?.avatar) {
      profile = await Profile.findByIdAndUpdate(profile.id, {
        $set: {
          profileCompleted: true,
        }
      });
    }

    user = await User.findById(req.params.id).populate("profileId");

    res.locals.status = 200;
    res.locals.data = user;
  } catch (error) {
    console.log(`Error updating user details due to: ${error.message}`);

    return next(error);
  }

  next();
};
const respondJSON = (req, res) => {
  if (res.locals.status === 200) {
    res.status(200).json({
      status: true,
      data: res.locals.data
    });
  } else {
    res.status(res.locals.status).json({
      status: false,
      data: res.locals.data,
    });
  }
};

export {signup, checkEmail, mailTransporter, verifyEmail, login, getUser, users, updateProfile, respondJSON};