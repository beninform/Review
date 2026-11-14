function loadGallery(imgNums) {

  const gallery = document.getElementById('gallery');
  const imgContainer = document.querySelector('.img-container');
  imgContainer.innerHTML = '';

  let ixAdj = tskNums[0]-1;
  let galTaskNumbers = [];
  imgNums.forEach(imageNr => {
    let imagNum = parseInt(imageNr);
    const taskNum = imagNum - 1;
    const ixx = taskNum-ixAdj;
    let taskNo = taskNum.toString();
    if ( taskNo=='1021' ) {
      taskNo='eg';
    }
    galTaskNumbers.push(taskNo);
    // Wrap both image and label in an anchor tag to make the whole card clickable
    const link = document.createElement('a');
    link.onclick = ()=>{
      index = ixx;
      updateDisplay();
    };

    link.className = 'card';

    const img = document.createElement('img');
    img.src = `/img/p${imageNr}.png`;
    img.alt = `Image ${imageNr}`;
    img.loading = 'lazy'; // Improves scrolling performance for large lists

    const label = document.createElement('span');
    label.textContent = `${taskNo}`;

    link.appendChild(img);
    link.appendChild(label);
    imgContainer.appendChild(link);

  });
}

