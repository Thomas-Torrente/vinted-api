const Offer = require("./models/Offer");
const router = require("./routes/user");

router.get("/publish", async (req, res) => {
  try {
    let filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

  if (req.query.priceMin) {
    filters.product_price = {
      $gte: req.query.priceMin,
    };
  }

  if (req.query.priceMax) {
    filters.product_price = {
      $lte: req.query.priceMax,
    };
  }

  let sort = {};
  if (req.query.sort === "price-desc") {
    sort.product_price = 1;
  } else if (req.query.sort === "price asc") {
    sort.product_price = -1;
  }

  let page;
  if (Number(req.query.page)) {
    page = 1;
  } else {
    page = Number(req.query.page);
  }
  let limit = Number(req.query.limit);

  const offers = await Offer.find(filters)
    .select("product_name product_price")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  
  const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }


router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }


});
