// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat and Dog model
const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat and Dog
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultDog = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// object for us to keep track of the last Cat and Dog we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);
let lastAddedDog = new Dog(defaultDog);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// function to find all cats on request.
// Express functions always receive the request and the response.
const readAllCats = (req, res, callback) => {
  Cat.find(callback);
};

const readAllDogs = (req, res, callback) => {
  Dog.find(callback);
};

// function to find a specific cat on request.
// Express functions always receive the request and the response.
const readCat = (req, res) => {
  const name1 = req.query.name;

  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  Cat.findByName(name1, callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.render('page4', { dogs: docs });
  };
  readAllDogs(req, res, callback);
};

// function to handle get request to send the name
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

// function to handle a request to set the name
// controller functions in Express receive the full HTTP request
// and get a pre-filled out response object to send
const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // if not respond with a 400 error
    // (either through json or a web page depending on the client dev)
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  // create a new object of CatModel with the object to save
  const newCat = new Cat(catData);

  // create new save promise for the database
  const savePromise = newCat.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newCat;
    // return success
    res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
  });

  // if error, return it
  savePromise.catch(err => res.json({ err }));

  return res;
};

const setNameDog = (req, res) => {
  if (!req.body.name || !req.body.breed || !req.body.age) {
    // if not respond with a 400 error
    // (either through json or a web page depending on the client dev)
    return res.status(400).json({ error: 'name, breed and age are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.name}`;

  // dummy JSON to insert into database
  const dogData = {
    name,
    breed: req.body.breed,
    age: req.body.age,
  };

  // create a new object of CatModel with the object to save
  const newDog = new Dog(dogData);

  // create new save promise for the database
  const savePromise = newDog.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newDog;
    // return success
    res.json({ name: lastAdded.name, breed: lastAdded.breed, age: lastAdded.age });
  });

  // if error, return it
  savePromise.catch(err => res.json({ err }));

  return res;
};

// function to handle requests search for a name and return the object
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const searchName = (req, res) => {
  // check if there is a query parameter for name
  if (!req.query.name) {
    return res.json({ error: 'Name is required to perform a search' });
  }

  // Call our Cat's static findByName function.
  // Since this is a static function, we can just call it without an object
  // pass in a callback (like we specified in the Cat model
  return Cat.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // if no matches, let them know
    // (does not necessarily have to be an error since technically it worked correctly)
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // if a match, send the match back
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  });
};

const searchNameDog = (req, res) => {
  // check if there is a query parameter for name
  if (!req.query.name) {
    return res.json({ error: 'Name is required to perform a search' });
  }

  return Dog.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // if no matches, let them know
    // (does not necessarily have to be an error since technically it worked correctly)
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    lastAddedDog = Dog(doc);

    lastAddedDog.age++;

    const savePromise = lastAddedDog.save();

    savePromise.then(() => res.json({
      name: lastAddedDog.name,
      breed: lastAddedDog.breed,
      age: lastAddedDog.age,
    }));

    savePromise.catch(err2 => res.json({ err2 }));

    // if a match, send the match back
    return res.json({
      name: lastAddedDog.name,
      breed: lastAddedDog.breed,
      age: lastAddedDog.age,
    });
  });
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  // send back the name as a success for now
  savePromise.then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }));

  // if save error, just return an error for now
  savePromise.catch(err => res.json({ err }));
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

/*
const readDog = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  Dog.findByName(name1, callback);
};
*/


// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
  setNameDog,
  searchNameDog,
};
