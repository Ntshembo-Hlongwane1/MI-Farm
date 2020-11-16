import { userModel } from "../../Models/Users/Users";
import Bcrypt from "bcrypt";
import Formidable from "formidable";
import dotenv from "dotenv";
dotenv.config();

class AccountRecovery {
  forgotPassword(request, response) {
    const form = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        const { email } = fields;

        if (!email) {
          return response
            .status(400)
            .json({ msg: "Enter email used to signup" });
        }

        const user = await userModel.findOne({ email: email });

        if (!user) {
          return response.status(400).json({ msg: "No user with this email" });
        }

        const transporter = nodemailer.createTransport({
          service: "SendinBlue",
          auth: {
            user: process.env.sendinBlue__email,
            pass: process.env.sendinBlue__key,
          },
        });

        const mailOptions = {
          from: process.env.sendinBlue__email,
          to: email,
          subject: "Reset Password",
          html: `
    
                <h1>Click link below to rest password</h1>
                <a href="http://localhost:3000/${user._id * 2}/pass-reset/${
            user._id * 5
          }" target="_blank"></a>
    
              `,
        };

        transporter.sendMail(mailOptions, (error, res) => {
          if (error) {
            return response.status(500).json({
              msg: "Network error password rest failed please try again later",
            });
          }

          return response
            .status(200)
            .json({ msg: `Password rest link has been sent to ${email}` });
        });
      });
    } catch (error) {
      return response
        .status(400)
        .json({ msg: "Network error please try again later " });
    }
  }
}
