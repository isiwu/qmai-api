import "core-js/stable";
import "regenerator-runtime/runtime";

//import cron from "node-cron";
import { mailTransporter } from "./controllers/userContollers";
import Trainee from "./models/trainee";

const scheduleTraineeCertification = () => {
  Trainee.find({hasPayForCertificate: true, "cert.isCertified": false}, (error, trainees) => {
    if (error) {
      console.log(`Error in fetching the uncertified trainees due to: ${error.message}`);
      return;
    }

    if (!trainees.length) {
      //No trainee to issue certifcate;
      return;
    }

    const dueTrainees = trainees.filter(trainee => {
      const dueDate = new Date(trainee.certPaymentAt).setMinutes(new Date(trainee.certPaymentAt).getMinutes() + 3);
      const currDate = new Date();

      if (currDate >= dueDate) return true;
      else return false;
    });

    dueTrainees.forEach(dueTrainee => {
      const subject = `QSMAI ${dueTrainee?.course?.charAt(0).toUpperCase()}${dueTrainee?.course?.slice(1)} Membership Certificate`,
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
                    <div style="font-size:20px ; padding-top:2rem; line-height: 2rem;font-weight:1px;">We are delighted to inform you that your <b style="font-weight: bolder">${dueTrainee?.course?.charAt(0).toUpperCase()}${dueTrainee?.course?.slice(1)} certificate</b> is ready.</div>
                    <br><br>
                    <div>You can download it here by clicking the link below.</div>
                    <br><br>
                    <div style="margin-top: 10px;"><a style="font-size: 20px; text-decoration: none; padding: 10px 20px; background-color: green; border-radius: 20px; color: white;" href="https://qmai.herokuapp.com/certs/cert.svg" download>Download</a></div>
                </div>
              </div>
            </div> 
        </body>
        </html>`;

        //let mailSuccessfull = true;
        const mail = {
          from: "support@achlps.com",
          to: dueTrainee.email,
          subject,
          html: mailMessage,
        };

        const transporter = mailTransporter();
        try {
          transporter.sendMail(mail);

          console.log("mail sent");
          dueTrainee.cert.isCertified = true;
          dueTrainee.save();
        } catch (error) {
          console.log(`Error in sending mail certification to  due trainee due to: ${error.message}`);
        }

      // User.findOne({profileId: dueMember.id})
      // .then((user) => {
      //   userData = user;
      //   return user;
      // })
      // .then(user => {
      //   return Member.findById(user).exec();
      // })
      // .then(data => {
      //   const membershipType = data.type;

      //   const subject = `QMAI ${membershipType?.charAt(0).toUpperCase()}${membershipType?.slice(1)} Membership Certificate`,
      //   mailMessage = `<!DOCTYPE html>
      //   <html lang="en">
      //   <head>
      //       <meta charset="UTF-8">
      //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
      //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //       <title>About flexbox</title>
      //       <link rel="stylesheet" href="flex.css">
      //   </head>
      //   <body>
      //     <div style="width:100%; height:500px;padding-top:50px;">
      //         <div style="background-color:#f1f1f1; width: 55%; height: 400px; border-radius: 20px;margin: auto; ">
      //           <div style="padding: 0 3rem;" >
      //               <h1 style="color:green  ; padding-top: 2rem;">Hi,</h1>
      //               <div style="font-size:20px ; padding-top:2rem; line-height: 2rem;font-weight:1px;">We are delighted to inform you that your <b style="font-weight: bolder">${membershipType?.charAt(0).toUpperCase()}${membershipType?.slice(1)} certificate</b> is ready.</div>
      //               <br><br>
      //               <div>You can download it here by clicking the link below.</div>
      //               <br><br>
      //               <div style="margin-top: 10px;"><a style="font-size: 20px; text-decoration: none; padding: 10px 20px; background-color: green; border-radius: 20px; color: white;" href="https://qmai.herokuapp.com/certs/cert.svg" download>Download</a></div>
      //           </div>
      //         </div>
      //       </div> 
      //   </body>
      //   </html>`;

      //   //let mailSuccessfull = true;
      //   const mail = {
      //     from: "support@achlps.com",
      //     to: userData.email,
      //     subject,
      //     html: mailMessage,
      //   };

      //   const transporter = mailTransporter();
      //   return transporter.sendMail(mail);
      // })
      // .then(() => {
      //   console.log("mail sent");
      //   dueMember.isCertified = true;
      //   dueMember.membershipStatus = "Active";
      //   dueMember.save();
      // })
      // // .catch(error => {
      // //   console.log(`Error in getting the member data due to: ${error.message}`);
      // // })
      // .catch(error => {
      //   console.log(`Error in getting the member user data due to: ${error.message}`);
      // });
    });
  });

  // cron.schedule("* * * * *", () => {
   
  // });
};

export default scheduleTraineeCertification;