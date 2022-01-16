import * as React from 'react';
import { GatsbyImage,getImage, ImageDataLike } from 'gatsby-plugin-image';
import { Link} from "gatsby";
import * as styles from "./footer.module.css";

interface Props{
  data: GatsbyTypes.BlogPostsQuery['allMdx']['nodes'][0]['frontmatter']
}
export const Card: React.FC<Props> = ({ data }) => {
  if (data === undefined) {
    throw new Error(`should be`)
  }
  const { hero_image, hero_image_alt, title, path, date } = data;
  if (hero_image === undefined||hero_image_alt === undefined||title === undefined||date === undefined) {
    throw new Error(`should be`)
  }

  const image = getImage(hero_image as ImageDataLike)
  if (image === undefined) {throw new Error(`should be`)}

  return (
    <Link className={ styles.siteTitle} to={`${path}/`}>
      <div className={ styles.card}>
        <GatsbyImage className={ styles.image} image={image} alt={hero_image_alt} />
        <p>{ title}</p>
        <p>Posted: {date}</p>
      </div>
    </Link>
  )
}