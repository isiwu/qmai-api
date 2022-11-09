import ATP from "../models/atp";
import ATPInstructor from "../models/atp-instructor";
import Course from "../models/course";
import Member from "../models/member";
import User from "../models/user";
import Profile from "../models/profile";
import { mailTransporter } from "./userContollers";
import Transaction from "../models/transaction";
import Certificate from "../models/certificate";
import Trainee from "../models/trainee";

const dashboardStat = async (req, res, next) => {
  let membershipStat, atpStat, courseStat, atpInstructorStat;
  try {
    membershipStat = await Member.estimatedDocumentCount({});
  } catch (error) {
    console.log(`Error in gettting membership stat due to: ${error.message}`);

    return next(error);
  }

  try {
    atpStat = await ATP.estimatedDocumentCount({});
  } catch (error) {
    console.log(`Error in getting the atp stat due to: ${error.message}`);

    return next(error);
  }

  try {
    courseStat = await Course.estimatedDocumentCount({});
  } catch (error) {
    console.log(`Error in getting course stat due to: ${error.message}`);

    return next(error);
  }

  try {
    atpInstructorStat = await ATPInstructor.estimatedDocumentCount({});
  } catch (error) {
    console.log(`Error in getting the atp-instructor stat due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = {membershipStat, atpStat, courseStat, atpInstructorStat,};

  next();
},
activeMembers = (active) => async (req, res, next) => {
  let certified;
  try {
    certified = await Profile.find({isCertified: true, membershipStatus: `${active}`});
  } catch (error) {
    console.log(`Error in getting the certified members due to: ${error.message}`);
    return next(error);
  }

  const certifiedCommands = [];
  certified?.forEach(data => {
    certifiedCommands.push(User.findOne({profileId: data?.id}).populate("profileId").exec());
  });

  let certifiedUsers;
  try {
    certifiedUsers = await Promise.all(certifiedCommands);
  } catch (error) {
    console.log(`Error in getting the certified user data due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = certifiedUsers;

  next();
},
newMembers = async (req, res, next) => {
  let newMembersProfile;
  try {
    newMembersProfile = await Profile.find({hasApplied: true, applicationApproved: false});
  } catch (error) {
    console.log(`Error in getting the new members profile data due to: ${error.message}`);

    return next(error);
  }

  let newMembersUserData, newMembersUserDataCommands = [];
  newMembersProfile.forEach(data => {
    newMembersUserDataCommands.push(User.findOne({profileId: data.id}).exec());
  });

  try {
    newMembersUserData = await Promise.all(newMembersUserDataCommands);
  } catch (error) {
    console.log(`Error in getting the new member user data due to: ${error.message}`);
  }

  const newMembersCommand = [];
  newMembersUserData.forEach(data => {
    newMembersCommand.push(Member.findById(data).exec());
  });

  let newMembers;
  try {
    newMembers = await Promise.all(newMembersCommand);
  } catch (error) {
    console.log(`Error in getting the new members due to: ${error.message}`);

    return next(error);
  }

  const commands = [];
  newMembers.forEach(newMember => {
    commands.push(User.findById(newMember).populate("profileId").exec());
  });

  let data;

  try {
    data = await Promise.all(commands);
  } catch (error) {
    console.log(`Error in fetching the member user data due to: ${error.message}`);
  }

  res.locals.status = 200;
  res.locals.data =  data;

  next();
},
viewMember = async (req, res, next) => {
  const {id} = req.params;
  if (!id) {
    res.locals.status = 400;
    res.locals.data = "incorrect input request";

    return next();
  }

  let user;
  try {
    user = await User.findById(id).populate("profileId");

    req.body.email = user.email;
  } catch (error) {
    console.log(`Error getting user data due to: ${error.message}`);

    return next(error);
  }

  let memberApplication;
  try {
    await Profile.findByIdAndUpdate(user?.profileId, {
      $set: {
        applicationReviewed: true,
      }
    });
  } catch (error) {
    console.log(`Error getting the applicant profile information due to: ${error.message}`);
  }
  
  try {
    memberApplication = await Member.findById(id);
  } catch (error) {
    console.log(`Error getting member application information due to: ${error.message}`);

    return next(error);
  }
 
  if (user?.profileId?.applicationApproved) {
    try {
      const transaction = await Transaction.findOne({transactBy: user?.id, tarnsactionType: memberApplication.type});

      res.locals.status = 200;
      res.locals.data = {
        ...memberApplication.toObject(),
        amount: transaction.amount,
      };

      return next();
    } catch (error) {
      console.log(`Error in getting the transaction amount of the user due to: ${error.message}`);
      return next(error);
    }
  }

  res.locals.status = 200;
  res.locals.data = memberApplication;
  next();
},
approveApplication = async (req, res, next) => {
  const {id} = req. params;

  let user;
  try {
    user = await User.findById(id);

    req.body.email = user.email;
  } catch (error) {
    console.log(`Error getting user data due to: ${error.message}`);

    return next(error);
  }

  try {
    await Profile.findByIdAndUpdate(user?.profileId, {
      $set: {
        applicationApproved: true,
      }
    });
  } catch (error) {
    console.log(`Error approving the member application due to: ${error.message}`);

    return next(error);
  }

  let memberApplication;
  try {
   memberApplication = await Member.findByIdAndUpdate(id, {
    $set: {
      new: false,
    }
   });
  } catch (error) {
    console.log(`Error getting member application info due to: ${error.message}`);

    return next(error);
  }

  const subject = `QMAI ${memberApplication?.type?.charAt(0).toUpperCase()}${memberApplication?.type?.slice(1)} Membership Application`,
  mailMessage = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>About flexbox</title>
      <link rel="stylesheet" href="flex.css">
  </head>
  <body>
     <div style="width:100%; height:500px;padding-top:50px;">
        <div style="background-color:#f1f1f1; width: 55%; height: 400px; border-radius: 20px;margin: auto; ">
          <div style="padding: 0 3rem;" >
              <h1 style="color:green  ; padding-top: 2rem;">Hi,</h1>
              <p style="font-size:20px ; padding-top:2rem; line-height: 2rem;font-weight:1px;">We want to inform you that your <b style="font-weight: bolder">${memberApplication?.type?.charAt(0).toUpperCase()}${memberApplication?.type?.slice(1)}</b> application has been reviewed and approved. You can go ahead and make payment to get your membership cerficate.</p>
              <br><br>
              <p style>Please login to your dashboard and to go membership and click on <b>Apply for Membership</b> continue.</p>
          </div>
        </div>
      </div> 
  </body>
  </html>`;

  let mailSuccessfull = true;
  const mail = {
    from: "support@achlps.com",
    to: req.body.email,
    subject,
    html: mailMessage,
  };
  try {
    const transporter = mailTransporter();
    await transporter.sendMail(mail);
    //await sendMail(req, subject, mailMessage);
  } catch (error) {
    console.log(`Error sending membership application approval mail due to: ${error.message}`);
    mailSuccessfull = false;
  }

  if (!mailSuccessfull) {
    try {
      await Profile.findByIdAndUpdate(user?.profileId, {
        $set: {
          applicationApproved: false,
        }
      });
      
      res.locals.status = 500;
      res.locals.data = "Approval failed!";
      console.log("Unable to mail member");
      
      return next();
    } catch (error) {
      console.log(`Error resetting member profile status due to: ${error.message}`);

      return next(error);
    }
  }

  try {
    await Member.findByIdAndUpdate(id, {
      $set: {
        new: false,
        pending: true,
      }
    });
  } catch (error) {
    console.log(`Error in updating the membership status due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
},
pendingMembers = async (req, res, next) => {
  let pendingMembersProfile;
  try {
    pendingMembersProfile = await Profile.find({hasApplied: true, applicationApproved: true, certificateMembershipPayment: false});
  } catch (error) {
    console.log(`Error in getting the new members profile data due to: ${error.message}`);

    return next(error);
  }

  let pendingMembersUserData, pendingMembersUserDataCommands = [];
  pendingMembersProfile.forEach(data => {
    pendingMembersUserDataCommands.push(User.findOne({profileId: data.id}).exec());
  });

  try {
    pendingMembersUserData = await Promise.all(pendingMembersUserDataCommands);
  } catch (error) {
    console.log(`Error in getting the new member user data due to: ${error.message}`);
  }

  const pendingMembersCommand = [];
  pendingMembersUserData.forEach(data => {
    pendingMembersCommand.push(Member.findById(data).exec());
  });

  let pendingMembers;
  try {
    pendingMembers = await Promise.all(pendingMembersCommand);
  } catch (error) {
    console.log(`Error in getting the new members due to: ${error.message}`);

    return next(error);
  }
  // let newMembers;

  // try {
  //   newMembers = await Member.find({new: false, pending: true});
  // } catch (error) {
  //   console.log(`Error in getting the new members due to: ${error.message}`);

  //   return next(error);
  // }
  const commands = [];
  pendingMembers.forEach(newMember => {
    commands.push(User.findById(newMember).populate("profileId").exec());
  });

  let data;

  try {
    data = await Promise.all(commands);
  } catch (error) {
    console.log(`Error in fetching the member user data due to: ${error.message}`);
  }

  //console.log(data);

  res.locals.status = 200;
  res.locals.data =  data;

  next();
},
activateMember = (activate) => async (req, res, next) => {
  const {id} = req.params;

  if (!id || !activate) {
    res.locals.status = 400;
    res.locals.data = "incorrect input request";

    return next();
  }

  try {
    await Member.findByIdAndUpdate(id, {
      $set: {
        active: activate,
      }
    });
  } catch (error) {
    console.log(`Error in activating member active status due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
},
viewCertificates = async (req, res, next) => {
  let certs;
  try {
    certs = await Certificate.find({}).exec();
  } catch (error) {
    console.log(`Error getting certificates due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = certs;

  next();
},
addCertificate = async (req, res, next) => {
  const {certNo, certTitle, awarding, content} = req.body;
  
  if (!certNo | !certTitle | awarding | content) {
    res.locals.status = 400;
    res.locals.data = "Incorrect request input";

    return next();
  }

  // GENERATE CERTIFICATE HERE
  try {
    await Certificate.create({
      title: certTitle,
      no: certNo,
      awardingOrganisation: awarding,
      content,
    });
  } catch (error) {
    console.log(`Error in creating new certificate due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
editCertificate = async (req, res, next) => {
  const {id} = req.params;
  //const {certTitle, content, certNo, awarding} = req.body;

  if (!id) {
    res.locals.status = 400;
    res.locals.data = "incorrect input request";

    return next();
  }

  for (const key in req.body) {
    if (Object.hasOwnProperty.call(req.body, key)) {
      if (req.body[key]) {
        try {
          await Certificate.findByIdAndUpdate(id, {
            $set: {[key]: req.body[key]}
          });
        } catch (error) {
          console.log(`Error in updating certificate ${key} due to: ${error.message}`);
          return next(error);
        }
      }
    }
  }

  // if (certTitle) {
  //   try {
  //     await Certificate.findByIdAndUpdate(id, {
  //       $set: {title: certTitle}
  //     });
  //   } catch (error) {
  //     console.log(`Error in updating certificate title due to: ${error.message}`);
  //     return next(error);
  //   }
  // }

  // if (content) {
  //   try {
  //     await Certificate.findByIdAndUpdate(id, {
  //       $set: {content}
  //     });
  //   } catch (error) {
  //     console.log(`Error in updating certificate content due to: ${error.message}`);
  //     return next(error);
  //   }
  // }

  // if (certNo) {
  //   try {
  //     await Certificate.findByIdAndUpdate(id, {
  //       $set: {no: certNo}
  //     });
  //   } catch (error) {
  //     console.log(`Error in updating certificate number due to: ${error.message}`);
  //     return next(error);
  //   }
  // }

  // if (awarding) {
  //   try {
  //     await Certificate.findByIdAndUpdate(id, {
  //       $set: {awardingOrganisation: awarding}
  //     });
  //   } catch (error) {
  //     console.log(`Error in updating certificate awarding organisation due to: ${error.message}`);
  //     return next(error);
  //   }
  // }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
verifyCertificate = async (req, res, next) => {
  const {awarding, certTitle, certNo} = req.body;
  
  if (!awarding | !certTitle | !certNo) {
    res.locals.status = 400;
    res.locals.data = "incorrect input request";

    return next();
  }

  let cert;
  try {
    cert = await Certificate.findOne({certNo}).exec();
  } catch (error) {
    console.log(`Error in getting certificate to be verified due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = cert?.content;

  next();
},
getATPs = async (req, res, next) => {
  let atps = [];

  try {
    atps = await ATP.find({}, "-applicationType").exec();
  } catch (error) {
    console.log(`Error in getting atps from ATP model due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = atps;
  next();
},
getActiveATPTrainees = async (req, res, next) => {
  const { atpId } = req.params;
  let activeATPTrainees = [];
  try {
    activeATPTrainees = Trainee.find({atpId, cert: {isCertified: true, hasExpired: false}}).exec();
  } catch (error) {
    console.log(`Error in getting active APT trainees due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = activeATPTrainees;

  next();
},
getInActiveATPTrainees = async (req, res, next) => {
  const { atpId } = req.params;
  let inActiveATPTrainees = [];
  try {
    inActiveATPTrainees = Trainee.find({atpId, cert: {isCertified: true, hasExpired: true}}).exec();
  } catch (error) {
    console.log(`Error in getting inactive APT trainees due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = inActiveATPTrainees;

  next();
},
getPendingATPTrainees = async (req, res, next) => {
  const { atpId } = req.params;
  let pendingATPTrainees = [];
  try {
    pendingATPTrainees = Trainee.find({atpId, hasPayForCertificate: true, cert: {isCertified: false, hasExpired: false}}).exec();
  } catch (error) {
    console.log(`Error in getting inactive APT trainees due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = pendingATPTrainees;

  next();
};

export {
  dashboardStat,
  activeMembers,
  newMembers,
  viewMember,
  approveApplication,
  pendingMembers,
  activateMember,
  viewCertificates,
  addCertificate,
  editCertificate,
  verifyCertificate,
  getATPs,
  getActiveATPTrainees,
  getInActiveATPTrainees,
  getPendingATPTrainees,
};