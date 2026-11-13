// gallery.js


let cnt = 0;
function loadGallery(imgNums) {
  console.log('gallery load');
  console.log(imgNums);
  cnt += 1;

  if (cnt>1) {
    return;
  }
  const gallery = document.getElementById('gallery');
  const imgContainer = document.querySelector('.img-container');
  // const srcText = `img/p${imageNr}.png`;

  let ix = -1;
  imgNums.forEach(imageNr => {
  	ix += 1;
  	const ixx = ix;
    let imagNum = parseInt(imageNr);
    const taskNum = imagNum - 1;
    let taskNo = taskNum.toString();
    if ( taskNo=='1021' ) {
      taskNo='eg';
    }
    // Wrap both image and label in an anchor tag to make the whole card clickable
    const link = document.createElement('a');
    // link.href = `view.html?id=${encodeURIComponent(id)}`;
    link.onclick = ()=>{
    	console.log('clicked', ixx, taskNo)
    	gallDiv.style.display = 'none';
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

    // imgContainer.appendChild(img);
  });
}

