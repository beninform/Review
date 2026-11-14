
// run functions after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
	loadResponses();
});

const X_TO_GET = 5;  // how many nearest to the key value to get for stats buttons


const taskHead = document.querySelector('h3');
const imageTag = document.getElementById('pimg');
const inputZro = document.getElementById('input-0');
const inputOne = document.getElementById('input-1');
const trStatus = document.getElementById('trial-status');
const togglBtn = document.querySelector('.tab-btn');
const tbContnr = document.getElementById('table-container'); // candidate rules table
const tabContr = document.querySelector('.tab-container');  // container of the tab controls (rules and instructions) 
const gallDiv = document.getElementById('gallery');


togglBtn.innerText = 'Toggle';
togglBtn.addEventListener('click', (e) => {
    toggleCandidateRules();
})

const statsButtons = setUpStatsButtons();

let data = [];
let imgNums = [];
let tskNums = [];
let tskTims = [];
let index = 0;
let fileExtn = '';

function loadResponses() {
    const fileInput = document.querySelector('.fileInput');
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        const filename = files[0].name;
        fileExtn = getExtension(filename)
        data = [];
        imgNums = [];
        tskNums = [];
        tskTims = [];
        index = 0;
        if ( fileExtn != 'csv' ) {
            alert('Cannot use this file! Only csv files!');
            return
        } else {
            sessionType = getSessionType(filename);
            if ( sessionType == 'wcr' ) {
                wCandidateRules();
            }
        }
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
                    tskNum = parseInt(imgNum)-1;
                    tskNums.push(tskNum);
                }
                tskTim = row.data.trial_time;
                if (tskTim) {
                    tskTims.push(parseInt(tskTim));
                }
            },
            complete: function(results) {
                tskNums.shift(); // remove the first (eg) task number (has no time)
                tbody = generateTable();
                const myDataLen = data.length;
                const taskArr = [...Array(myDataLen).keys()];

                calcStats(tskTims);  // also adds click to stat buttons
                updateDisplay();  // changes the displayed task, user responses and rules

                prevBtn = document.getElementById('prev-btn');
                nextBtn = document.getElementById('next-btn');
                gallBtn = document.getElementById('gall-btn');

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
    // zero-based indexing plus an empty last element in data array
    const dataLen = data.length-2;

    // constrain the value of index to avoid errors
    if ( index < 0 ) {  // prevent index errors
        index = 0;
    }
    if ( index > dataLen ) {  // prevent index errors
        index = dataLen;
    }

    // get the detail of the task at the current index
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
    
    tbContnr.appendChild(table);

    return tbody;

}


function removeIfExists (selector) {
  var x = document.querySelector(selector)
  if (x) x.remove()
}


function getExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  // Ensure dot exists, is not the first character, and is not the last character
  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    return filename.slice(lastDotIndex + 1);
  }
  return '';
}   

function getSessionType(filename) {
    const uscoreIdx = filename.indexOf('_');
    if ( uscoreIdx>0 && uscoreIdx < filename.length - 1) {
       const sType = filename.slice(uscoreIdx+1,uscoreIdx+4);
       return sType;
    } else {
        return '';
    }
}

function toggleCandidateRules() {
    if ( tbContnr.classList.contains('hidden') ) {
        if ( fileExtn == 'csv' ) {
            tbContnr.classList.remove('hidden');
        }    
    } else {
        tbContnr.classList.add('hidden');
    };    
}

function wCandidateRules() {
    tbContnr.classList.remove('hidden');
}


function getNearestXToValInArr(valueIn, arrayIn, X_TO_GET) {
    // local copy of magic number of values to get for each key stat in timing
    const x_to_get = X_TO_GET;

    // a new array with each element having three values: value, index, distance
    const indexedArr = arrayIn.map((value, index) => ({
        value,
        index,
        distance: Math.abs(value - valueIn)
    }));    

    // the new array sorted by distance from the valueIn
    indexedArr.sort((a, b) => a.distance - b.distance)

    // the X entries with the shortest distance from valueIn (the closest)
    const newArr = indexedArr.slice(0, x_to_get);
    console.log('newArr', newArr);

    // the original index values of the X closest
    const idxArr = newArr.map(item => item.index);

    // the original task numbers of the X with timings closest to valueIn
    return idxArr.map(index => tskNums[index]);


}

function setUpStatsButtons() {

    // create five buttons for five stats points in the distribution of times
    const minBtn = document.createElement('button');
    const lQ_Btn = document.createElement('button');
    const medBtn = document.createElement('button');
    const uQ_Btn = document.createElement('button');
    const maxBtn = document.createElement('button');

    minBtn.id = 'min-btn';
    lQ_Btn.id = 'loq-btn';
    medBtn.id = 'med-btn';
    uQ_Btn.id = 'upq-btn';
    maxBtn.id = 'max-btn';

    minBtn.classList.add('jspsych-btn');
    lQ_Btn.classList.add('jspsych-btn');
    medBtn.classList.add('jspsych-btn');
    uQ_Btn.classList.add('jspsych-btn');
    maxBtn.classList.add('jspsych-btn');

    minBtn.innerText = 'min';
    lQ_Btn.innerText = 'LQ';
    medBtn.innerText = 'median';
    uQ_Btn.innerText = 'UQ';
    maxBtn.innerText = 'max';

    const statsBtnsDiv = document.createElement('div');
    statsBtnsDiv.setAttribute('class', 'stats-button-div');

    statsBtnsDiv.appendChild(minBtn);
    statsBtnsDiv.appendChild(lQ_Btn);
    statsBtnsDiv.appendChild(medBtn);
    statsBtnsDiv.appendChild(uQ_Btn);
    statsBtnsDiv.appendChild(maxBtn);

    tabContr.appendChild(statsBtnsDiv);   

    return [minBtn, lQ_Btn, medBtn, uQ_Btn, maxBtn]; 
}


function showRelatedGallery(task_array) {
    const imgNums3 = taskNumsToImgNums(task_array);
    loadGallery(imgNums3);
    if (gallDiv.style.display === "none") {
        gallDiv.style.display = "grid";
    } else {
        gallDiv.style.display = "none";
    }      
}


function taskNumsToImgNums(task_array) {
    const imgNums2 = []
    task_array.forEach(tasknumber =>{
        taskString = (tasknumber+1).toString();
        imgNumber = ('00'+taskString).substring(-4);
        imgNums2.push(imgNumber);
    })
    return imgNums2;
}


function calcStats(tskTims) {
    // local copy of magic number of values to get for each key stat in timing
    const x_to_get = X_TO_GET;

    if ( tskTims.length > 0 ) {
        const myLen = tskTims.length;
        const myMin  = Math.min(...tskTims);
        const myMax  = Math.max(...tskTims);

        const mymean = ss.mean(tskTims);
        const stdDev = ss.standardDeviation(tskTims);

        const lQ = ss.quantile(tskTims, 0.25); 
        const median = ss.median(tskTims);
        const uQ = ss.quantile(tskTims, 0.75); 

        // give X task numbers around each key stat timing

        const tsksNrstToMedian = getNearestXToValInArr(median, tskTims, x_to_get);
        console.log('ToMedian', median.toFixed(1), tsksNrstToMedian);

        const tsksNrstToMin = getNearestXToValInArr(myMin, tskTims, x_to_get);
        console.log('ToMin', myMin.toFixed(1), tsksNrstToMin);

        const tsksNrstToMax = getNearestXToValInArr(myMax, tskTims, x_to_get);
        console.log('ToMax', myMax.toFixed(1), tsksNrstToMax);

        const tsksNrstToLQ = getNearestXToValInArr(lQ, tskTims, x_to_get);
        console.log('ToLQ', lQ.toFixed(1), tsksNrstToLQ);

        const tsksNrstToUQ = getNearestXToValInArr(uQ, tskTims, x_to_get);
        console.log('ToUQ', uQ.toFixed(1), tsksNrstToUQ);

        console.log('myLen', myLen);


        statsButtons[0].addEventListener('click', (e)=>{
            showRelatedGallery(tsksNrstToMin);
        });

        statsButtons[1].addEventListener('click', (e)=>{
            showRelatedGallery(tsksNrstToLQ);
        });

        statsButtons[2].addEventListener('click', (e)=>{
            showRelatedGallery(tsksNrstToMedian);
        });

        statsButtons[3].addEventListener('click', (e)=>{
            showRelatedGallery(tsksNrstToUQ);
        });

        statsButtons[4].addEventListener('click', (e)=>{
            showRelatedGallery(tsksNrstToMax);
        });

        // return [myMin, lQ, median, uQ, myMax]
    } 
}

