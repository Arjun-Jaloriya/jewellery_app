const Setting = require("../Models/Setting");

const addRate = async (req, res) => {
  try {
    const { goldRate, silverRate } = req.body;


    if (!goldRate || !silverRate) {
      return res
        .status(400)
        .send({ error: "Both goldRate and silverRate are required." });
    }

    const updatedRate = await Setting.findOneAndUpdate(
      {}, // Empty filter to match any document
      { goldRate, silverRate }, // Data to update or insert
      { new: true, upsert: true, useFindAndModify: false } // Options: return updated document, create if not found
    );

    if (updatedRate) {
      return res.status(200).send({
        success: true,
        msg: updatedRate._id
          ? "Updated TodayRate successfully."
          : "Added TodayRate successfully.",
        results: updatedRate,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, msg: "Error in addOrUpdateRate.", error });
  }
};

module.exports = { addRate };
