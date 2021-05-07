const { Schema, model } = require("mongoose");

const { User } = require("./User");

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
}

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title can't be empty"],
    },
    body: {
      type: String,
      unique: true,
      required: [true, "body can't be empty"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

PostSchema.pre("save", function () {
  this.slug = slugify(this.title);
});

const Post = model("Post", PostSchema);

module.exports = Post;
