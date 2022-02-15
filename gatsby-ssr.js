export const onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const headComponents = getHeadComponents();
  headComponents.sort((a, b) => {
    // console.log(`===================a.type`);
    // console.log(a.type);

    // console.log(`===================b.type`);
    // console.log(b.type);
    if (a.type === `meta` && b.type !== `meta`) {
      return -1;
    } else if (b.type === `meta` && a.type !== `meta`) {
      return 1;
    }
    return 0;
  });

  replaceHeadComponents(headComponents);
  const lh = getHeadComponents();
  for (let i = 0; i < 10; i++) {
    console.log(lh[i].type);
  }
};
