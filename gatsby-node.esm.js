import path from "path";

export const createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('ERROR: Loading "createPages" query');
  }

  const posts = result.data.allMdx.edges;

  posts.forEach(({ node }) => {
    console.log(node.fields.slug);
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/post.tsx`),
      context: { id: node.id },
    });
  });
};
