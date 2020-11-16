import { userModel } from "../../Models/Users/Users";
import Bcrypt from "bcrypt";
import Formidable from "formidable";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class userAuth {
  SignUp(request, response) {
    const form = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        const {
          username,
          firstName,
          lastName,
          email,
          password,
          verifiedPassword,
        } = fields;

        if (
          !username ||
          !firstName ||
          !lastName ||
          !email ||
          !password ||
          !verifiedPassword
        ) {
          return response
            .status(400)
            .json({ msg: "All fields have to be entered" });
        }

        if (password.length < 6) {
          return response
            .status(400)
            .json({ msg: "Password has to be at least 6 characters" });
        }

        if (password !== verifiedPassword) {
          return response.status(400).json({ msg: "Password have to match" });
        }

        const isExistingUserName = await userModel.findOne({
          username: username,
        });

        if (isExistingUserName) {
          return response
            .status(400)
            .json({ msg: "Account with this username already exist" });
        }

        const isExistingEmail = await userModel.findOne({ email: email });

        if (isExistingEmail) {
          return response
            .status(400)
            .json({ msg: "Account with this email already exist" });
        }

        const salt = await Bcrypt.genSalt(15);
        const hashedPassword = await Bcrypt.hash(password, salt);
        const newUser = new userModel({
          username,
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();

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
          subject: "Account Activation",
          html: `

                <h1>Activate your account by clicking on link below<h1>
                <a href="http://localhost:5000/account-activation/${savedUser._id}" target="_blank">Account activation</a>
            
            
            `,
        };

        transporter.sendMail(mailOptions, (error, res) => {
          if (error) {
            return response.status(500).json({
              msg: `Network error please try again later, if error continues contact ${process.envsendinBlue__email}`,
            });
          }

          return response.status(201).json({
            msg: `Email has been sent to ${email} for Account activation`,
          });
        });
      });
    } catch (error) {
      return response.status(500).json({
        msg: `Network error please try again later, if error continues contact ${process.envsendinBlue__email}`,
      });
    }
  }

  async accountActivation(request, response) {
    const user_id = request.params.id;

    try {
      const user = await userModel.findOne({ _id: user_id });

      if (!user) {
        return response.status(400).json({ msg: "Account does not exist" });
      }

      user.isActive = true;
      const updated_document = await userModel.findOneAndUpdate(
        { _id: user_id },
        user,
        {
          new: true,
        }
      );

      return response.status(200).redirect("http://localhost:3000/");
    } catch (error) {
      return response.status(500).json({
        msg: "Failed to activate account Network Error please try again",
      });
    }
  }

  Login(request, response) {
    const form = new Formidable.IncomingForm();
    try {
      form.parse(request, async (error, fields, files) => {
        const { username, password } = fields;

        if (!username || !password) {
          return response
            .status(400)
            .json({ msg: "All fields have to be entered" });
        }

        const isExistingUser = await userModel.findOne({ username: username });

        if (!isExistingUser) {
          return response
            .status(400)
            .json({ msg: "User with this account does not exist" });
        }

        const isPasswordValidated = await Bcrypt.compare(
          password,
          isExistingUser.password
        );

        if (!isPasswordValidated) {
          return response.status(400).json({ msg: "Invalid crendentials" });
        }

        if (!isExistingUser.isActive) {
          return response
            .status(400)
            .json({ msg: "Activate your account before logging in" });
        }

        const sessionUser = {
          id: isExistingUser._id,
          username: isExistingUser.username,
          email: isExistingUser.email,
        };
        request.session.user = sessionUser;

        response.send(request.session.sessionID);
      });
    } catch (error) {
      return response
        .status(500)
        .json({ msg: "Network error please try again later" });
    }
  }
}

export default userAuth;
