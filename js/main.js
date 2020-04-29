'use strict'

const game = {
    compShots: [],
    compShips: [],
    playerShips: [],
    compCollision: [],
    playerCollision: [],
    playerShipsCount: 0,
    computerShipsCount: 0,
    optionShip: {
        count: [1, 2, 3, 4],
        size: [4, 3, 2, 1],
    },
    show: {
        hit (elem) {
            elem.style.backgroundColor = colors.shipHit;
        },

        miss(elem) {
            elem.style.backgroundColor = colors.shipMiss; 
        },

        dead(elem) {
            elem.style.backgroundColor = colors.shipDead;  
        }
    },
    
    shoot(event) {
        let isMiss = true; 
        const target = event.target;
        const player_name = target.id.split('_')[1];
        const id = target.id.split('_')[0];
        if (!game.playerShipsCount) return; //запрещаем стрелять по окончании игры
        if (target.getAttribute('style')) return; //запрещаем стрелять в уже подбитые клетки
        if (target.tagName === 'TD') {
            game.show.miss(target);
            
        }

        for (let ship of game.compShips) {
            const index = ship.position.findIndex(item => id === item);

            if (index >= 0) { //при попадании заполняем массив hits и окрашиваем элемент в зеленый
                game.show.hit(target);
                ship.hits[index] = 'x'; 
                isMiss = false;
                const isAlive = ship.hits.indexOf('');

                if (isAlive < 0) {
                    game.show.dead(target);
                    for (let id of ship.position) {
                        game.show.dead(document.getElementById(`${id}_${player_name}`));
                    }

                    game.playerShipsCount--;
                    if (!game.playerShipsCount) {
                        process.textContent = 'Вы победили!';
                        process.style.color = colors.playerWon;
                    }
                }
            }
        }
        
        if (isMiss === true) {
            game.shotByComputer(); //передаем ход компьютеру, если промахнулись
        }
    },
	
    /**
     * ИИ очень глупого компьютера
     */
    shotByComputer() {
        let id = Math.floor(Math.random() * Math.floor(100))+'';
        if (id < 10) id = '0' + id; //добавляем нулевую координату X
        const target = document.getElementById(`${id}_player`);
        if (game.compShots.includes(id)) {
            return game.shotByComputer();
        }
        game.compShots.push(id);
        if (target.tagName === 'TD') {
            game.show.miss(target);
            
        }
        for (let ship of game.playerShips) {
            const index = ship.position.findIndex(item => id === item);

            if (index >= 0) {
                game.show.hit(target);
                ship.hits[index] = 'x';
                const isAlive = ship.hits.indexOf('');

                if (isAlive < 0) {
                    game.show.dead(target);
                    for (let id of ship.position) {
                        game.show.dead(document.getElementById(`${id}_player`));
                    }

                    game.computerShipsCount--;
                    if (!game.computerShipsCount) {
                        process.textContent = 'Компьютер победил!';
                        process.style.color = colors.computerWon;
                    }
                }
                game.shotByComputer();
                
            }
        }
    },
    
    /**
     * Создаем поле кораблей
     */
    generateShips(ships, collision, name) {
        for (let i = 0; i < this.optionShip.count.length; i++) {
            for (let j = 0; j < this.optionShip.count[i]; j++) {
                const size = this.optionShip.size[i];
                const ship = this.generateShipOptions(size, collision);
                ships.push(ship);
                name === 'computer' ? this.computerShipsCount++ : this.playerShipsCount++;
            }
        }
    },
    
    /**
     * Создаем корабль и возвращаем его
     */
    generateShipOptions(shipSize, collision) {
        const ship = {
            hits: [],
            position: [],
        };
        
        const direction = Math.random() < 0.5;
        const rand = (arg) => Math.floor(Math.random() * (10 - arg));
        let x, y;
        
        if (direction) {
            x = rand(0);
            y = rand(shipSize);
        } else {
            x = rand(shipSize);
            y = rand(0);
        }
        
        for (let i = 0; i < shipSize; i++) {
            if (direction) {
                ship.position.push(x + '' + (y + i));
            } else {
                ship.position.push((x + i) + '' + y);
            }
            ship.hits.push('');
        }
        
        if (this.checkCollision(ship.position, collision)) {
            return this.generateShipOptions(shipSize, collision);
        }
        
        this.addCollision(ship.position, collision);
        
        return ship;
    },
    
    /**
     * Проверка на пересечение с клетками, в которые установить корабль нельзя
     */
    checkCollision(position, collision) {
        for (let coord of position) {
            if (collision.includes(coord)) {
                return true;
            }
        }
    },
    
    /**
     * Добавляем клетки, в которые нельзя поставить каждый последующий корабль при построении
     * Исключаем таким образом наложение кораблей
     */
    addCollision(position, collision) {
        for (let i = 0; i < position.length; i++) {
            const startCoordX = position[i][0] - 1;
            
            for (let j = startCoordX; j < startCoordX + 3; j++) {
                const startCoordY = position[i][1] - 1;
                
                for (let z = startCoordY; z < startCoordY + 3; z++) {
                    
                    if (j >= 0 && j < 10 && z >= 0 && z < 10) {  
                        const coord = j + '' + z;
                        if (!collision.includes(coord)) {
                            collision.push(coord);
                        }
                    }
                }
            }
        }
    },
    
    renderField(name) {
        const table = document.getElementById(`main__${name}-field`);
        let id = 0;

        for (let i = 0; i < 10; i++) {
            let tr = document.createElement('tr');
            table.append(tr);
            for (let j = 0; j < 10; j++) {
                if (id < 10) id = '0' + id;
                tr.insertAdjacentHTML('beforeend', `<td id='${id}_${name}'></td>`);
                id++;
            }
        } 
    },
    
    renderPlayerShips() {
        for (let ship of game.playerShips) {
            for (let id of ship.position) {
                document.getElementById(`${id}_player`).style.backgroundColor = colors.playerShip;
            }   
        }
    }
};

const player_field = document.querySelector('#main__player-field');
const computer_field = document.querySelector('#main__computer-field');
const rerun = document.querySelector('.rerun__button');
const process = document.querySelector('.header__title');
const colors = {
    playerWon: '#248F40',
    computerWon: '#A60400',
    shipHit: '#248F40',
    shipMiss: '#BF3330',
    shipDead: '#121214',
    playerShip: '#9CA8C3'
}

const init = () => {
    game.renderField('player');
    game.renderField('computer');
    game.generateShips(game.compShips, game.compCollision, 'computer');
    game.generateShips(game.playerShips, game.playerCollision);
    game.renderPlayerShips();
    computer_field.addEventListener('click', game.shoot);
    rerun.addEventListener('click', () => {
        location.reload();
    });
    
};

init();

