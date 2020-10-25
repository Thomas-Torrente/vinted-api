const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);

    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    // Créer une nouvelle annonce (sans image)
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // console.log(newOffer);

    // Envoi de l'image à cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    // console.log(result);
    // Ajoute result à product_image
    newOffer.product_image = result;

    // Sauvegarder l'annonce
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    // création d'un objet dans lequel on va sotcker nos différents filtres
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i"); // permet de récuperer tout les produits ayant un titre avec le mot mis dans le query / le I permet de rendre incensible a la casse c'est a dire qu'on s'en fou si ya des maj ou des min
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin, // permet de récuperer tout les produis avec comme prix minimum celui mis dans le query
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax, // permet de récuperer tout les produis avec comme prix max celui mis dans le query
        };
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 }; // permet de trier les prix des produit par ordre décroissant
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 }; // permet de trier les prix des produit par ordre croissant
    }

    let limit = Number(req.query.limit); // Quand on met des nombres dans le query c'est considére comme une chaine de carrectere le Number permet de forcer a le mettre en number

    const offers = await Offer.find(filters) // affiche dans la liste des offers les produits avec le nom du produit les détail le prix et l'image avec le lien sécuriser
      .select(
        "product_name product_details product_price product_image.secure_url"
      )
      .sort(sort) // // sort permet de trier par ordre croissant ou décroissant .sort

      .limit(limit); // renvoyer le nombre d'affichage max qu'on a mis dans la query

    // cette ligne va nous retourner le nombre d'annonces trouvées en fonction des filtres
    const count = await Offer.countDocuments(filters); // permet de compter tous les trucs qu'il y a dans offer

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// Route qui permmet de récupérer les informations d'une offre en fonction de son id
router.get("/offer/:id", async (req, res) => {
  try {
    const offerId = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offerId);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
