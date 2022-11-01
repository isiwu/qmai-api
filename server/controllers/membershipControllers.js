import Audit from "../models/audit";
import Member from "../models/member";
import Profile from "../models/profile";
import Transaction from "../models/transaction";
import User from "../models/user";

const getMembershipId = async (length) => {
  let randomUniqueId, idExists;

  //ENSURE LENGTH
  // eslint-disable-next-line no-constant-condition
  while (true) {
    randomUniqueId = Math.floor(Math.random() * Date.now()).toString();

    if (randomUniqueId.length >= length) break;
  }

  const uniqueCode = Number(randomUniqueId.slice(0, length));

  //ENSURE CODE UNIQUENESS
  try {
    idExists = await Member.exists({membershipId: uniqueCode});
  } catch (error) {
    console.log(`Error fetching user info in genUniqueCode controller due to: ${error.message}`);
  }

  if (idExists) getMembershipId(length);
  else return `QM${uniqueCode}A`;
};
const checkMembership = async (req, res, next) => {
  try {
    if (await Member.exists({_id: req.params.id})) {
      res.locals.status = 200;
      res.locals.data = true;
    } else {
      res.locals.status = 200;
      res.locals.data = false;
    }

    next();
  } catch (error) {
    console.log(`Error checking membership exist due to: ${error.message}`);

    return next();
  }
};
const getmembershipInfo = async (req, res, next) => {
  try {
    const member = await Member.findById(req.body.id);
    res.locals.status = 200;
    res.locals.status = member;
  } catch (error) {
    console.log(`Error get the membership infomation of the user due to: ${error.message}`);

    return next(error);
  }

  next();
};
const apply = async (req, res, next) => {
  const {id} = req.params;
  const {membershipType, studingQMAI, yearsOfWorkExp, yearsOfSystemExp, otherRDocName, amount} = req.body;
  let user;

  if (!membershipType) {
    res.locals.status = 400;
    res.locals.data = "server response";

    return next();
  }

  try {
    user = await User.findById(id);
  } catch (error) {
    console.log(`Error getting user information due to: ${error.message}`);

    return next(error);
  }

  if (!user) {
    res.locals.status = 400;
    res.locals.data = "Incorrect user input.";

    return next();
  }

  const membershipId = await getMembershipId(3);

  try {
    await Member.create({
      _id: id,
      type: membershipType,
      membershipId,
      studingQMAI,
      yearsOfWorkExp: parseFloat(yearsOfWorkExp),
      yearsOfSystemExp: parseFloat(yearsOfSystemExp),
      cv: req.cv,
      otherRelevantDocument: {
        url: req.otherRDoc,
        name: otherRDocName,
      }
    });

    try {
      await Transaction.create({
        transactBy: user.id,
        tarnsactionType: `${membershipType} form membership`,
        transactionDate: Date.now(),
        amount
      });
    } catch (error) {
      console.log(`Error in storing the user transaction detail in transaction model due to: ${error.message}`);
    }

  } catch (error) {
    console.log(`Error in creating user application due to: ${error.message}`);
    return next(error);
  }

  try {
    await Profile.findByIdAndUpdate(user?.profileId, {
      $set: {
        hasApplied: true,
        formMembershipPayment: true,
        formMembershipPaymentAt: Date.now(),
      }
    });
  } catch (error) {
    console.log(`Error setting the user profile application status due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";
  next();
};
const completeApplication = async (req, res, next) => {
  const {id} = req.params;
  const {amount, date, transactionId, type} = req.body;
  //const {date} = req.body;
  let  user;

  try {
    user = await User.findById(id).populate("profileId");
  } catch (error) {
    console.log(`Error getting the member user information due to: ${error.message}`);
    return next(error);
  }


  if (!user?.profileId?.hasApplied) {
    res.locals.status = 403;
    res.locals.data = "Cannot continue this process because you did not make any application in the first place.";

    return next();
  }

  if (!user?.profileId?.applicationReviewed) {
    res.locals.status = 403;
    res.locals.data = "Cannot continue this process because your application has not been reviewed.";

    return next();
  }

  if (!user?.profileId?.applicationApproved) {
    res.locals.status = 403;
    res.locals.data = "Cannot continue this process because your application has not been approved.";

    return next();
  }

  try {
    await Transaction.create({
      transactBy: id,
      transactionDate: date,
      tarnsactionType: type,
      transactionId: transactionId,
      amount,
    });
  } catch (error) {
    console.log(`Error in write to transaction model for the user due to: ${error.message}`);
  }

  try {
    await Profile.findByIdAndUpdate(user?.profileId._id, {
      $set: {
        certificateMembershipPayment: true,
        certificateMembershipPaymentAt: Date.now()
      }
    });
  } catch (error) {
    console.log(`Error updating the member user profile due to: ${error.message}`);

    return next(error);
  }

  try {
    await Member.findByIdAndUpdate(id, {
      $set: {
        certificatePayment: true,
      }
    });
  } catch (error) {
    console.log(`Error updating the user membership data due to: ${error.message}`);

    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = "";

  next();
},
addAudit = async (req, res, next) => {
  const { userId } = req.params;
  const { name, info } = req.body;
  console.log(name);
  console.log(info);
  console.log(req.doc);

  if (!name || !info || !req.doc) {
    res.locals.status = 400;
    res.locals.data = "Incorrect input";
    return next();
  }

  try {
    await Audit.create({
      name,
      info,
      userId,
      doc: req.doc
    });
  } catch (error) {
    console.log(`Error adding new audite due to: ${error.message}`);
    return next(error);
  }
  
  res.locals.status = 200;
  res.locals.data = "";
  next();
},
auditRecord = async (req, res, next) => {
  const { userId } = req.params;

  let records = [];
  try {
    records = await Audit.find({userId}).exec();
  } catch (error) {
    console.log(`Error in fetching the audite record due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = records;
  next();
},
viewAudit = async (req, res, next) => {
  const { userId, id } = req.params;

  let audite = {};
  try {
    audite = await Audit.findOne({_id: id, userId}).exec();
  } catch (error) {
    console.log(`Error in getting the audite due to: ${error.message}`);
    return next(error);
  }

  res.locals.status = 200;
  res.locals.data = audite;
  next();
};

export {
  checkMembership, 
  getmembershipInfo, 
  apply, 
  completeApplication, 
  addAudit, 
  auditRecord, 
  viewAudit
};