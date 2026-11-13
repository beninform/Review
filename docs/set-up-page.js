
// run functions after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
	loadResponses();
});


const taskHead = document.querySelector('h3');
const imageTag = document.getElementById('pimg');
const inputZro = document.getElementById('input-0');
const inputOne = document.getElementById('input-1');
const trStatus = document.getElementById('trial-status');

let data = [];
let imgNums = [];
let tskTims = [];
let index = 0;

function loadResponses() {
    const fileInput = document.querySelector('.fileInput');
    fileInput.addEventListener('change', () => {
        Papa.parse(fileInput.files[0], {
            download: true,
            header: true,
            keepEmptyRows: false,
            skipEmptyLines: true,
            step: function(row) {
                data.push(row.data);
                imgNum = row.data.imagenr;
                if (imgNum) {
                    imgNums.push(imgNum);
                }
                tskTim = row.data.trial_time;
                if (tskTim) {
                    tskTims.push(tskTim);
                }
            },
            complete: function(results) {
                tbody = generateTable();
                const dataLen = data.length;
                const taskArr = [...Array(dataLen).keys()];

                updateDisplay();

                prevBtn = document.getElementById('prev-btn');
                nextBtn = document.getElementById('next-btn');
                gallBtn = document.getElementById('gall-btn');
                gallDiv = document.getElementById('gallery');

                prevBtn.addEventListener('click', () => {
                    if (index > 0) {
                        index--;
                    }
                    updateDisplay();
                });

                nextBtn.addEventListener('click', () => {
                    if (index < taskArr.length - 1) {
                        index++;
                    }
                    updateDisplay();
                });

                gallBtn.addEventListener('click', () => {
                    loadGallery(imgNums);
                    if (gallDiv.style.display === "none") {
                        gallDiv.style.display = "grid";
                    } else {
                        gallDiv.style.display = "none";
                    }                    
                })
            }     
        });
    });
}


function updateDisplay() {
    console.log('raw index', index);
    const dataLen = data.length-2;
    console.log('dataLen', dataLen);
    if ( index < 0 ) {
        index = 0;
    }
    if ( index > dataLen ) {
        index = dataLen;
    }
    let taskRsp = data[index]
    const imageNr = taskRsp.imagenr;  // string BP No
    const blockId = taskRsp.blockId;
    const tStat   = taskRsp.trial_status;
    const jsnResp = JSON.parse(taskRsp.response);
    let imagNum = parseInt(imageNr);
    const taskNum = imagNum - 1;
    const srcText = `img/p${imageNr}.png`;
    const ruleA = jsnResp['a_rule'];
    const ruleB = jsnResp['b_rule'];
    if (blockId == 'Session 0') {
        taskHead.innerText = 'Example Task';
    } else {
        taskHead.innerText = blockId + ' Task ' + taskNum;
    }
    imageTag.src       = srcText;
    inputZro.innerText = ruleA;
    inputOne.innerText = ruleB;
    trStatus.innerText = tStat;

    if (imagNum==1022) {  // cater for inserted example problem - use eg rule from candidate rules, which is numbered 1
        imagNum=1;
    }
    populateTable(imagNum, tbody);
}



function populateTable(bongProbNumber, tbody) {

    // get array for this BP's candidate rules
    const data = rulesArray.filter((item) => item.BP == bongProbNumber);    
    // shuffle(data);

    // Guard clause to handle empty arrays safely
    if (!data || data.length === 0) return;

    // Truncate table (drop all rows)
    tbody.innerHTML = '';

    // Loop through array to create rows and cells
    data.forEach(item => {  // each json element (each row)
        const row = document.createElement('tr');
        let aContent = item['A']  !== undefined ? item['A']  : '';
        let bContent = item['B']  !== undefined ? item['B']  : '';
        let aToolTip = item['A1'];
        let bToolTip = item['B1'];
        [aContent,bContent].forEach(cellContent => {
            const cell = document.createElement('td');
            cell.textContent = cellContent; 
            cell.setAttribute('onclick', 'logCellText(this)');
            span = document.createElement("span");
            span.classList.add("ToolTip")
            if (cellContent==aContent) {
                if (aToolTip) {
                    span.textContent = aToolTip;
                    cell.appendChild(span)
                }
            } else if (cellContent==bContent) {
                if (bToolTip) {
                    span.textContent = bToolTip;
                    cell.appendChild(span)
                }
            }
            row.appendChild(cell);
        });    
        tbody.appendChild(row);
    });    
}



function generateTable() {
    // if rules table exists, drop it
    rulesTableSelector = '#rules-table';   
    removeIfExists(rulesTableSelector); 

    // Create table elements (excluding regular rows)
    const table = document.createElement('table');
    table.id = "rules-table";
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');

    const keys = ['A', 'B'];  // 
    keys.forEach(key => {
        if ( ['A', 'B'].includes(key) ) {
            const th = document.createElement('th');
            th.textContent = 'AI rule for set '+key;
            headerRow.appendChild(th);
        }
    });

    thead.appendChild(headerRow);

    // Assemble and inject the complete table into the DOM
    table.appendChild(thead);
    table.appendChild(tbody);
    
    const container = document.getElementById('table-container');
    container.appendChild(table);

    return tbody;

}


function removeIfExists (selector) {
  var x = document.querySelector(selector)
  if (x) x.remove()
}

