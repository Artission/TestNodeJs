const limit = 20;
let current1Page = 1;
let is1Loading = false;
let has1MoreData = true; 
let filter1Word = '';

let current2Page = 1;
let is2Loading = false;
let has2MoreData = true; 
let filter2Word = '';


const list1Element = document.getElementById('list-1');
const list2Element = document.getElementById('list-2');
const filter1Element = document.getElementById('filter-1');
const filter2Element = document.getElementById('filter-2');
const filter1But = document.getElementById('filter-but-1');
const filter2But = document.getElementById('filter-but-2');
const addBut = document.getElementById('input-but-1');
const addElement = document.getElementById('input-1');
let list1LoadedItems = [];
let list2LoadedItems = [];

const sortableOptions = {
            group: 'shared', 
            animation: 150,  
            onEnd: function (evt) {
                // Здесь можно отловить момент окончания перетаскивания
                console.log('Элемент перемещен:', {
                    from: evt.from.id, // откуда
                    to: evt.to.id,     // куда
                    oldIndex: evt.oldIndex,
                    newIndex: evt.newIndex
                });
                let item;
                let targetList;
                let newIndex;
                let fromList;
                let toList;
                if (evt.from.id=='list-1'){
                    fromList = list1LoadedItems;                    
                } else {
                    fromList = list2LoadedItems;
                }
                if (evt.to.id=='list-2'){
                    targetList = '2';
                    toList = list2LoadedItems;
                } else {
                    targetList = '1';
                    toList = list1LoadedItems;
                }
                [item] = fromList.splice(evt.oldIndex,1);
                for (let i = evt.oldIndex; i < fromList.length; i++) {
                    const element = fromList[i];
                    element.sortOrder--;
                }
                let prevNewIndexItem = toList[evt.newIndex];
                if (prevNewIndexItem){
                    newIndex = prevNewIndexItem.sortOrder;
                }else{
                    newIndex = 0;
                }
                toList.splice(newIndex, 0, item);
                for(let i = evt.newIndex; i < toList.length; i++){
                    const element = toList[i];
                    element.sortOrder++;
                }

                if (item) {
                    fetch('/api/items/move',{
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({itemId: item.id, targetList, newIndex})
                    })
                }
            }
        };

Sortable.create(list1Element, sortableOptions);
Sortable.create(list2Element, sortableOptions);


function createItemElement(text) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerText = text;
    return div;
}

function clear1List(){
    const nodes = Array.from(list1Element.childNodes);
    const nodesLength = nodes.length;
    for (var i=0; i<nodesLength; i++){
        const node = nodes[i];
        if (node.className=='item'){
            list1Element.removeChild(node);
        }
    }
    list1LoadedItems = [];
}

async function load1Items() {
    if (is1Loading || !has1MoreData) return;
    
    is1Loading = true;
    
    try {
        
        const response = await fetch(`/api/items/1?page=${current1Page}&limit=${limit}&filter=${filter1Word}`);
        
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json(); 

        const items = data.items || data; 

        if (items.length === 0) {
            has1MoreData = false;
            is1Loading = false;
            return;
        }

        items.forEach(item => {
            const itemText = item.value;
            const itemEl = createItemElement(itemText);
            list1Element.appendChild(itemEl);
            list1LoadedItems.push(item);
        });

        current1Page++;

        if (items.length < limit) {
            has1MoreData = false;
        }

    } catch (error) {
        console.error('Не удалось загрузить элементы:', error);
    } finally {
        is1Loading = false;
    }
}

function clear2List(){
    const nodes = Array.from(list2Element.childNodes);
    const nodesLength = nodes.length;
    for (var i=0; i<nodesLength; i++){
        const node = nodes[i];
        if (node.className=='item'){
            list2Element.removeChild(node);
        }
    }
    list2LoadedItems = [];
}

async function load2Items() {
    if (is2Loading || !has2MoreData) return;
    
    is2Loading = true;
    
    try {
        
        const response = await fetch(`/api/items/2?page=${current2Page}&limit=${limit}&filter=${filter2Word}`);
        
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json(); 

        const items = data.items || data; 

        if (items.length === 0) {
            has2MoreData = false;
            is2Loading = false;
            return;
        }

        items.forEach(item => {
            const itemText = item.value;
            const itemEl = createItemElement(itemText);
            list2Element.appendChild(itemEl);
            list2LoadedItems.push(item);
        });

        current2Page++;

        if (items.length < limit) {
            has2MoreData = false;
        }

    } catch (error) {
        console.error('Не удалось загрузить элементы:', error);
    } finally {
        is2Loading = false;
    }
}



list1Element.addEventListener('scroll', () => {
    const scrollPosition = list1Element.scrollTop + list1Element.clientHeight;
    const scrollThreshold = list1Element.scrollHeight - 50; 
    if (scrollPosition >= scrollThreshold) {
        load1Items();
    }
});

filter1But.addEventListener('click',()=>{
    filter1Word = filter1Element.value;
    clear1List();
    current1Page = 1;
    has1MoreData = true;
    load1Items();
});

list2Element.addEventListener('scroll', () => {
    const scrollPosition = list2Element.scrollTop + list2Element.clientHeight;
    const scrollThreshold = list2Element.scrollHeight - 50; 
    if (scrollPosition >= scrollThreshold) {
        load2Items();
    }
});

filter2But.addEventListener('click',()=>{
    filter2Word = filter2Element.value;
    clear2List();
    current2Page = 2;
    has2MoreData = true;
    load2Items();
});

addBut.addEventListener('click', ()=>{
    const addValue = addElement.value;
    if (addValue.length==0){
        return;
    }
    fetch('/api/items',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({value: addValue})
    }).then((resp)=>{
        const addDiv = createItemElement(addValue);
        const nodes = Array.from(list1Element.childNodes);
        if (nodes.length>=2){
            list1Element.prepend(addDiv);
        } else {
            list1Element.append(addDiv);
        }
        for(let i=0;i<list1LoadedItems.length;i++){
            list1LoadedItems[i].sortOrder++;
        }
        list1LoadedItems.push({value: addValue, sortOrder:0, id: resp.id});
    });

});

load1Items();
load2Items();