import * as React from 'react';
import { graphql, PageProps } from "gatsby";
import { GatsbyImage,getImage} from "gatsby-plugin-image";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider }  from "@mdx-js/react"

import Layout from "../components/layout";


import * as styles from "./_mdxSlug.module.css"



const BlogPost:React.FC<PageProps<any>> = (props:any) => {
  const { mdx } = props.data;
  const { body, frontmatter } = mdx || {}
  const { title, date, hero_image_alt,hero_image_credit_link, hero_image_credit_text } = frontmatter
  const image = getImage(frontmatter.hero_image)

  if (image === undefined) {
    throw new Error(`image should be got`)
  }
  return (
    <Layout pageTitle={title}>
      <h1>{title}</h1>
      <p className={ styles.date}>{ date}</p>
      <div className={ styles.photoInfo}>
          <GatsbyImage className={ styles.image}image={image} alt={hero_image_alt} />
        <p className={ styles.credit}>
          Photo Credit:{" "}
          <a href={hero_image_credit_link} className={ styles.creditLink}>
            {hero_image_credit_text}
          </a>
        </p>
      </div>
      <div className={styles.contents}>
        <MDXProvider components={{ h2: props => <h2 {...props} style={{color:"red"}}/>}}>
          <MDXRenderer>{body}</MDXRenderer>
        </MDXProvider>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        date
        hero_image_alt
        hero_image_credit_link
        hero_image_credit_text
        hero_image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`;

export default BlogPost;
