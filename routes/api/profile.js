const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const axios = require('axios');
const config = require('config')

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//create user profile
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').not().isEmpty(),
      check('skills', 'Skills is required,').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // craeting skills array
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // create social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // create profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//get user profile by userId
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile)
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      console.log('here');
      return res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server Error');
  }
});

// delete profile and user and posts

router.delete('/', auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// adding experience in profile

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required.').not().isEmpty(),
      check('company', 'Company is required.').not().isEmpty(),
      check('from', 'From date is required.').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// deleting experience

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get experience index for removal
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// adding education in profile

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required.').not().isEmpty(),
      check('degree', 'Degree is required.').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
      check('from', 'From date is required.').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// deleting education

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get education index for removal
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// get github profile
router.get('/github/:username', async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`);
    if (response.status !== 200) {
      res.status(404).json({ msg: 'Profile not found for this user.' })
    }
    const { data } = response;
    res.json(data)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})

module.exports = router;
