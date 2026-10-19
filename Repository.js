class Repository {
    constructor() {
        this.lists = {
            '1': [], 
            '2': []
        };

        var allItems = this.lists['1'];
        this.allValues = new Set();

        for(let i=0;i<1000000;i++){
            let ind = i+1;
            let name = 'Элемент '+ind;
            allItems.push({value:name, id:this.genId(), sortOrder:i});
            this.allValues.add(name);
        }        

        this.addBuffer = [];
        this.updateBuffer = new Map();

        this.startBatchProcessors();
    }


    getItems(listName, page = 1, limit = 20, filter='') {
        const list = this.lists[listName] || [];
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let filterItems = list;
        if (filter.length>0){
            filterItems = list.filter(e=>e.value.includes(filter))
        }
        
        const paginatedItems = filterItems.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            hasMore: endIndex < filterItems.length,
            total: filterItems.length
        };
    }

    addItem(listName, value) {
        if (!value) {
            throw new Error('Значение не может быть пустым');
        }

        if (this.allValues.has(value)) {
            throw new Error('Такое значение уже существует в системе');
        }

        this.allValues.add(value);

        const newId = this.genId();
        this.addBuffer.push({ listName, value, id:newId });

        return { success: true, message: 'Элемент принят в очередь на добавление', id: newId };
    }

    updateItemPosition(itemId, targetList, newIndex) {
        this.updateBuffer.set(itemId, { itemId, targetList, newIndex });

        return { success: true, message: 'Изменение позиции зафиксировано' };
    }

    startBatchProcessors() {
        setInterval(() => {
            if (this.addBuffer.length === 0) return;

            const batch = [...this.addBuffer];
            this.addBuffer = [];

            console.log(`[Батчинг 10с] Сохранение пачки из ${batch.length} элементов...`);

            const targetList = this.lists['1']
            let ind = batch.length-1;
            batch.forEach(item => {
                const newItem = {
                    id: item.id,
                    value: item.value,
                    sortOrder: ind
                };
                ind--;
                
                targetList.splice(0, 0, newItem);                
            });
            for(let i=batch.length; i<targetList.length; i++){
                targetList[i].sortOrder++;
            }
        }, 10000);

        setInterval(() => {
            if (this.updateBuffer.size === 0) return;

            const updates = Array.from(this.updateBuffer.values());
            this.updateBuffer.clear();

            console.log(`[Батчинг 1с] Применение пачки из ${updates.length} изменений позиций...`);

            updates.forEach(upd => {
                let foundItem = null;

                for (const listKey of Object.keys(this.lists)) {
                    const originList = this.lists[listKey];
                    const index = originList.findIndex(i => i.id === upd.itemId);
                    if (index !== -1) {
                        [foundItem] = originList.splice(index, 1);
                        for (let i = index; i < originList.length; i++) {
                            const element = originList[i];
                            element.sortOrder--;
                        }
                        break;
                    }
                }

                if (foundItem && this.lists[upd.targetList]) {
                    const targetList = this.lists[upd.targetList];
                    const safeIndex = Math.max(0, Math.min(upd.newIndex, targetList.length));
                    targetList.splice(safeIndex, 0, foundItem);
                    foundItem.sortOrder = safeIndex;
                    for (let i = safeIndex; i < targetList.length; i++) {
                        const element = targetList[i];                        
                        element.sortOrder++;
                    }
                }
            });
        }, 1000);
    }

    genId() {
        return 'item_' + Math.random().toString(36).substring(2, 9);
    }
}

module.exports = Repository;