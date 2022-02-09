import * as React from 'react';

import Layout from "../components/layout";



const AboutMe: React.FC= () => {

  return (
    <Layout pageTitle="About me">
      <div >
        <h1>About Me</h1>
        <h2>基本情報</h2>
        <ul>
          <li>名前：中野 頌吾</li>
          <li>Twitter: <a href="https://twitter.com/__shogo__">@__shogo__</a></li>
          <li>GitHub: <a href="https://github.com/shogo-nakano-desu">shogo-nakano-desu</a></li>
        </ul>

        <h2>経歴</h2>
        <p>2021</p>

        <h2>好きな</h2>


      </div>
    </Layout>
  )
};



export default AboutMe;
