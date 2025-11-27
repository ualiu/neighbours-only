const axios = require('axios');
const User = require('../models/User');
const Neighborhood = require('../models/Neighborhood');

// @desc    Show landing page
// @route   GET /
exports.showLanding = (req, res) => {
  res.render('index', { user: req.user });
};

// @desc    Show address signup form
// @route   GET /signup/address
exports.showAddressForm = (req, res) => {
  res.render('signup-address', { user: req.user });
};

// @desc    Complete user profile with address
// @route   POST /signup/complete-profile
exports.completeProfile = async (req, res) => {
  try {
    const { address, placeId } = req.body;

    if (!address || !placeId) {
      req.flash('error', 'Please provide a valid address');
      return res.redirect('/signup/address');
    }

    // Get place details from Google Places API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'address_components,formatted_address,geometry',
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK') {
      req.flash('error', 'Unable to process address. Please try again.');
      return res.redirect('/signup/address');
    }

    const placeDetails = response.data.result;
    const addressComponents = placeDetails.address_components;

    // Extract address components
    let sublocality = '';
    let city = '';
    let province = '';
    let postalCode = '';
    let country = '';

    addressComponents.forEach((component) => {
      if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
        sublocality = component.long_name;
      }
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        province = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        postalCode = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.short_name;
      }
    });

    // If no sublocality, try using locality as fallback
    if (!sublocality && city) {
      sublocality = city;
    }

    if (!sublocality || !city) {
      req.flash('error', 'Unable to determine neighborhood from this address. Please try a more specific address.');
      return res.redirect('/signup/address');
    }

    const lat = placeDetails.geometry.location.lat;
    const lng = placeDetails.geometry.location.lng;

    // Generate neighborhood key (lowercase, hyphen-separated)
    const neighborhoodKey = `${sublocality.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase().replace(/\s+/g, '-')}-${province.toLowerCase()}`;

    // Check if neighborhood exists, if not create it
    let neighborhood = await Neighborhood.findOne({ key: neighborhoodKey });

    if (!neighborhood) {
      neighborhood = await Neighborhood.create({
        key: neighborhoodKey,
        name: sublocality,
        city: city,
        province: province,
        country: country,
        centroid: { lat, lng },
        memberCount: 1,
        createdBy: req.user._id,
      });
    } else {
      // Increment neighbour count
      neighborhood.memberCount += 1;
      await neighborhood.save();
    }

    // Update user with address and neighborhood
    req.user.address = {
      raw: address,
      formatted: placeDetails.formatted_address,
      sublocality: sublocality,
      city: city,
      postalCode: postalCode,
      province: province,
      country: country,
      lat: lat,
      lng: lng,
    };
    req.user.neighborhoodId = neighborhood._id;
    req.user.hasCompletedProfile = true;

    await req.user.save();

    req.flash('success', `Welcome to ${neighborhood.name}!`);
    res.redirect('/neighborhood');
  } catch (error) {
    console.error('Error completing profile:', error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/signup/address');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
};
