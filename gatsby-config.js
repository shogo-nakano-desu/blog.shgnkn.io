module.exports = {
  siteMetadata: {
    siteUrl: "https://www.shgnkn.io",
    title: "blog.shgnkn.io",
    description:
      "This blog is for recording and disseminating what I have learned and tried.",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `blog`,
        path: `${__dirname}/blog`,
      },
    },
  ],
};
