const MapboxCounter = require("../models/mapboxCounter");

// Configuration: free limit & safety threshold
const FREE_LIMIT = 100000;
const SAFETY_THRESHOLD = 10000;

async function mapboxSafetyMiddleware(req, res, next) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1–12

    // Find or create the counter doc for this month
    let counter = await MapboxCounter.findOneAndUpdate(
      { year, month },
      { $setOnInsert: { count: 0 } },
      { new: true, upsert: true }
    );

    // If already at threshold, block
    if (counter.count >= SAFETY_THRESHOLD) {
      req.flash("error", "Map api failed - geocoding temporarily disabled");
      return res.redirect("/listings");
    }

    // Otherwise increment and proceed
    counter.count++;
    await counter.save();

    next();
  } catch (err) {
    console.error("Mapbox limiter error:", err);
    // Failing open here—allow the request but log the error
    next();
  }
}

module.exports = { mapboxSafetyMiddleware };


// No need for a manual reset cron—since the middleware looks at the current month,
// as soon as the month changes, `findOneAndUpdate` will upsert a fresh counter with count=0.
