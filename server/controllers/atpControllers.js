import bcrypt from "bcrypt";
import ATP from "../models/atp";
import Course from "../models/course";
import Trainee from "../models/trainee";
import Transaction from "../models/transaction";
import User from "../models/user";

const getATP = async (req, res, next) => {
  const {id} = req.params;
  let atpData = {};
  try {
    const user = await User.findById(id, "-password").exec();
    atpData = {
      ...atpData,
      ...user.toObject(),
    };
  } catch (error) {
    console.log(`Error getting the ATP user data due to: ${error.message}`);
    return next(error);
  }
  try {
    const data = await ATP.findById(id).exec();
    atpData = {
      ...atpData,
      ...data.toObject()
    };
  } catch (error) {
    console.log(`Error fetching the ATP data due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = atpData;
  next();
},
changePassword = async (req, res, next) => {
  const { id } = req.params;
  const {email, oldPassword, newPassword} = req.body;

  if (!email || !oldPassword || !newPassword) {
    res.locals.status = 400;
    res.locals.data = "Incorrect input request";

    return next();
  }

  let user = {};
  try {
    user = await User.findOne({email, _id: id}).exec();
  } catch (error) {
    console.log(`Error in fetching the user data due to: ${error.message}`);

    return next(error);
  }

  if (!bcrypt.compareSync(oldPassword, user.password)){
    res.locals.status = 400;
    res.locals.data = "Incorrect input request";

    return next();
  }


  const salt = bcrypt.genSaltSync(16);
  const hash = bcrypt.hashSync(newPassword, salt);

  try {
    await User.findOneAndUpdate({email, _id: id}, {
      $set: {password: hash}
    }).exec();
  } catch (error) {
    console.log(`Error in changing the ATP password due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
application = async (req, res, next) => {
  const { id } = req.params;
  const { atpType, amount, date } = req.body;

  if (!atpType || !amount || !date) {
    res.locals.status = 400;
    res.locals.data = "Incorrect input request";

    return next();
  }

  const atpExpDate = new Date(date).setDate(new Date(date).getDate() + 2);
  try {
    await ATP.findByIdAndUpdate(id, {
      $set: {
        application: true,
        applicationType: atpType,
        RegDate: date,
        expDate: atpExpDate,
      }
    }).exec();
  } catch (error) {
    console.log(`Error ATP membership application due to: ${error.message}`);

    return next(error);
  }

  try {
    await Transaction.create({
      tarnsactionType: "ATP membership application",
      amount,
      transactionDate: date,
      transactBy: id,
    });
  } catch (error) {
    console.log(`Error in creating transaction record for ATP application due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
},
updateProfile = async (req, res, next) => {
  const {id} = req.params;
  const { name, contact, address, city, country, interest, otherInfo} = req.body;

  if (name) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {name}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP name due to: ${error.message}`);
      return next(error);
    }
  }

  if (contact) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {contact}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP contant due to: ${error.message}`);
      return next(error);
    }
  }

  if (address) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {address}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP address due to: ${error.message}`);
      return next(error);
    }
  }

  if (city) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {city}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP city due to: ${error.message}`);
      return next(error);
    }
  }

  if (country) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {country}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP country due to: ${error.message}`);
      return next(error);
    }
  }

  if (interest) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {interest}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP interest due to: ${error.message}`);
      return next(error);
    }
  }

  if (otherInfo) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {otherInfo}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP other info due to: ${error.message}`);
      return next(error);
    }
  }

  if (req.avatar) {
    try {
      await ATP.findByIdAndUpdate(id, {
        $set: {avatar: req.avatar}
      }).exec();
    } catch (error) {
      console.log(`Error in updating the ATP avatar due to: ${error.message}`);
      return next(error);
    }
  }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
courseApplication = async (req, res, next) => {
  const {atpId} = req.params;
  
  try {
    await Course.create({
      name: req.body.name,
      ATPId: atpId,
      fee: req.body.fee,
      info: req.body.info
    });
  } catch (error) {
    console.log(`Error in creating ATP course record due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
courses = async (req, res, next) => {
  const { atpId } = req.params;

  let courses = [];
  try {
    courses = await Course.find({userId: atpId}).exec();
  } catch (error) {
    console.log(`Error in getting the ATP courses due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = courses;
  next();
},
addTrainee = async (req, res, next) => {
  const { atpId } = req.params;
  const {firstName, lastName, email, course} = req.body;

  try {
    await Trainee.create({
      name: {
        first: firstName,
        last: lastName
      },
      email,
      course,
      atpId,
    });
  } catch (error) {
    console.log(`Error in adding new trainee due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
},
getTrainees = (status) => async (req, res, next) => {
 const { atpId } = req.params;

 let trainees = [];
 try {
  if (status === "active") trainees = await Trainee.find({atpId, score: {$gt: 0}, cert: {isCertified: true}}).exec();
  if (status === "pending") trainees = await Trainee.find({atpId, score: {$gt: 0}, hasPayForCertificate: false}).exec();
  if (status === "new") trainees = await Trainee.find({atpId, score: 0, hasPayForCertificate: false}).exec();
 } catch (error) {
  console.log(`Error in getting ATP trainees due to: ${error.message}`);
  return next(error);
 }

 res.locals.status = 200;
 res.locals.data = trainees;
 next();
},
addTraineeScore = async (req, res, next) => {
  const { atpId, traineeId } = req.params;

  try {
    await Trainee.findOneAndUpdate({_id: traineeId, atpId}, {
      $set: {
        score: req.body.score,
      }
    }).exec();
  } catch (error) {
    console.log(`Error in adding the trainee score due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
},
traineeCertificatePayment = async (req, res, next) => {
  const { atpId } = req.params;
  const trainees = req.body;

  const traineeCommands = [];
  const paymentCommands = [];
  trainees.forEach(trainee => {
    traineeCommands.push(Trainee.findOneAndUpdate({_id: trainee._id, atpId}, {
      $set: {hasPayForCertificate: true}
    }).exec());

    paymentCommands.push(Transaction.create({transactBy: atpId, tarnsactionType: "ATP trainee certificate", amount: trainee.amount, transactionDate: trainee.date}));
  });

  try {
    await Promise.all(traineeCommands);
  } catch (error) {
    console.log(`Error in updating trainee model for certificate payment due to: ${error.message}`);
    return next(error);
  }

  try {
    await Promise.all(paymentCommands);
  } catch (error) {
    console.log(`Error in creating the transaction record for the ATP trainee due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
};

export {getATP, changePassword, application, courseApplication, courses, updateProfile, addTrainee, getTrainees, addTraineeScore, traineeCertificatePayment};