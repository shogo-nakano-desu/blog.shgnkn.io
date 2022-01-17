module.exports = {
  siteMetadata: {
    siteUrl: "https://www.shgnkn.io",
    title: "blog.shgnkn.io",
    description:
      "This blog is for recording and disseminating what I have learned and tried.",
    twitterUsername: "@__shogo__",
    image: "/favicon-16x16.png",
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
    {
      resolve: "gatsby-plugin-google-analytics",
      options: { trackingId: "G-ZBJ3NKJR4G" },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              // inlineCodeMarker: "`", //もしかしたらデフォルトで`かも
              showLineNumbers: true,
              // noInlineHighlight: false,
              prompt: {
                user: "root",
                host: "localhost",
                global: false,
              },
            },
          },
        ],
      },
    },
  ],
};
