import React from "react"
import { Helmet } from "react-helmet"
import { useLocation } from "@reach/router"
import { useStaticQuery, graphql } from "gatsby"

interface Props {
  title?: string,
  description?: string,
  image?:string,

}
const SEO:React.FC<Props> = ({ title, description,image }) => {
  const { pathname } = useLocation()

  const { site } = useStaticQuery(graphql`
  query {
    site {
      siteMetadata {
        defaultTitle: title
        defaultDescription: description
        siteUrl: siteUrl
        twitterUsername
      }
    }
  }
`)
  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    twitterUsername,
  } = site.siteMetadata
  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname}`,
  }
  console.log(seo.image)

  return (
    <Helmet title={seo.title} titleTemplate={`%s | ${defaultTitle}`} htmlAttributes={{
        lang: "ja",
      }} meta={[
      { name: 'description', content: seo.description },
      { name: 'image', content: seo.image },
      { name: 'og:url', content: seo.url },
      { name: 'og:type', content: 'website' },
      { name: 'og:title', content: seo.title },
      { name: 'og:description', content: seo.description },
      { name: 'og:image', content: seo.image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: twitterUsername },
      { name: 'twitter:title', content: seo.title },
      { name: 'twitter:image', content: seo.image },
      { name: 'twitter:description', content: seo.description },
    ]}>

      {twitterUsername && (
        <meta name="twitter:creator" content={twitterUsername} />
      )}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && (
        <meta name="twitter:description" content={seo.description} />
      )}
    </Helmet>
  )
}
export default SEO

SEO.defaultProps = {
  title: "blog.shgnkn.io",
  description: "リリース最優先",
}
