const Photo = require("../models/photo.model");
const Voter = require("../models/Voter.model");

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const fileExtension = [".jpg", ".png"];

    if (title && author && email && file) {
      // if fields are not empty...

      const fileName = file.path.split("/").slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileType = fileName.split(".").slice(-1)[0];
      const pattern = new RegExp(
        /(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/,
        "g"
      );
      const textMatched = fileName.match(pattern).join("");
      if (
        fileExtension.includes(fileType) &&
        fileName <= 50 &&
        textMatched.length > text.length
      ) {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: fileName,
          votes: 0
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      }
    } else {
      throw new Error("Wrong input!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

const checkVoter = async (voterIp, paramsID) => {
  const voter = await Voter.findOne({ user: voterIp });
  if (!voter) {
    // console.log("create new Voter");
    await new Voter({
      user: voterIp,
      votes: [paramsID]
    }).save();
    console.log(Voter.find());
  } else {
    if (voter.votes.includes(paramsID)) {
      throw new Error({ message: "już zagłosowano" });
    } else {
      await Voter.updateOne(
        { user: voterIp },
        { $set: { votes: [...voter.votes, paramsID] } }
      );
    }
  }
};

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) {
      return res.status(404).json({ message: "Not found" });
    }
    const ip = req.clientIp;
    checkVoter(ip, req.params.id);
    photoToUpdate.votes++;
    photoToUpdate.save();
    res.send({ message: "OK" });
  } catch (err) {
    res.status(500).json(err);
  }
};
