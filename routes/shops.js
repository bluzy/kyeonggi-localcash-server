var express = require('express');
var router = express.Router();
var axios = require('axios');

const mongoose = require('mongoose');
const Shop = mongoose.model("Shop");

const loadData = (page, count) => {
  console.log('Fetching data, page=' + page);
  axios.get(`https://openapi.gg.go.kr/RegionMnyFacltStus?KEY=${process.env.OPENAPI_KEY}&Type=json&pIndex=${page}&pSize=${count}`)
    .then(r => {
      if (!r.data["RegionMnyFacltStus"]) {
        return;
      }

      // console.log(JSON.stringify(r.data));
      const list = r.data["RegionMnyFacltStus"][1]["row"];

      console.log(`${list.length} received.`);
      if (list.length > 0) {
        list.forEach(async e => {
          const fullType = e["INDUTYPE_NM"];
          var type = null;
          var subtype = null;
          if (fullType) {
            const parts = fullType.split("-", 2);
            type = parts[0];
            if (parts.length > 1) {
              subtype = parts[1];
            }
          }

          const data = {
            city: e["SIGUN_NM"],
            name: e["CMPNM_NM"],
            lat: e["REFINE_WGS84_LAT"],
            lng: e["REFINE_WGS84_LOGT"],
            address: e["REFINE_ROADNM_ADDR"],
            type: type,
            subtype: subtype,
            tel: e["TELNO"],
          }

          const item = new Shop(data);

          await item.save();
        });

        loadData(page + 1, count);
      }
    })
    .catch(e => {
      console.log('failed to fetch data', e);
      console.log('waiting 5 sec');
      setTimeout(() => loadData(page, count), 5000);
    })
}

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const fromLat = req.query.from_lat;
  const fromLng = req.query.from_lng;

  const toLat = req.query.to_lat;
  const toLng = req.query.to_lng;

  const list = await Shop.find({
    lat: {
      $gte: parseFloat(fromLat),
      $lte: parseFloat(toLat)
    },
    lng: {
      $gte: parseFloat(fromLng),
      $lte: parseFloat(toLng)
    },
  })

  return res.status(200).json(list);
});

router.post('/', async (req, res, next) => {
  const from = req.query.from;
  var page = from ? parseInt(from) : 1;
  var count = 1000;

  if (page == 1) {
    Shop.remove({}, () => {
      loadData(page, count);
    });
  } else {
    loadData(page, count);
  }

  res.status(200).json({
    code: 0,
    message: "Success"
  })
});

module.exports = router;
