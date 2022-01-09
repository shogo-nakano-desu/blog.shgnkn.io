module.exports = {
  siteMetadata: {
    siteUrl: "https://www.shgnkn.io",
    title: "blog.shgnkn.io",
    description:
      "This blog is for recording and disseminating what I have learned and tried.",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-typegen",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `blog`,
        path: `${__dirname}/blog`,
        ignore: [`${__dirname}/src/__generated__/*.ts`],
      },
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: { extensions: [`.md`, `.mdx`] },
    },
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
  ],
};
