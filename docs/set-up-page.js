
// run functions after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
	loadResponses();
});


// loadResponses
function loadResponses() {
    const taskHead = document.querySelector('h3');
    const inputZro = document.getElementById('input-0');
    const inputOne = document.getElementById('input-1');
    const imageTag = document.getElementById('pimg');

    let data = [];
    let index = 0;
    const fileInput = document.querySelector('.fileInput');
    fileInput.addEventListener('change', () => {
        Papa.parse(fileInput.files[0], {
            download: true,
            header: true,
            keepEmptyRows: false,
            skipEmptyLines: true,
            step: function(row) {
                data.push(row.data);
            },
            complete: function(results) {
                tbody = generateTable(data);
                // console.log('1', data);
                const dataLen = data.length;
                // console.log('dataLen', dataLen);
                const taskArr = [...Array(dataLen).keys()];
                // console.log('taskArr', taskArr);

                updateDisplay();

                prevBtn = document.getElementById('prev-btn');
                nextBtn = document.getElementById('next-btn');

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

                function updateDisplay() {
                    let taskRsp = data[index]
                    const imageNr = taskRsp.imagenr;  // string BP No
                    const blockId = taskRsp.blockId;
                    const jsnResp = JSON.parse(taskRsp.response);
                    const imagNum = parseInt(imageNr);
                    const taskNum = imagNum - 1;
                    const srcText = `img/p${imageNr}.png`;
                    const ruleA = jsnResp['A-rule'];
                    const ruleB = jsnResp['B-rule'];

                    taskHead.innerText = blockId + ' Task ' + taskNum;
                    imageTag.src       = srcText;
                    inputZro.innerText = ruleA;
                    inputOne.innerText = ruleB;

                    populateTable(imagNum, tbody);
                }





            }        
        });
    });
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



function generateTable(data) {

    // Create table elements (excluding regular rows)
    const table = document.createElement('table');
    table.id = "rules-table";
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');

    // Extract and create headers dynamically using keys from the first object
    const keys = Object.keys(data[0]);  // all seven keys
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

