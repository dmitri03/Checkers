
/*=========variabile globale=========================*/

window.addEventListener('load', (event) => {

var field_class = document.getElementsByClassName("field");
var whiteCheckerClass = document.getElementsByClassName("checker_white");
var blackCheckerClass = document.getElementsByClassName("checker_black");
var turnDisplay = document.getElementById("TurnDisplay");


///////////////////////////////////////////////////                    CHANGE TABLE SIZE !!!!!!
var WhiteCheckerArray = [];
var BlackCheckerArray = [];
var field = [];
var moveLength = 80 ;
var MoveToCenter = 8;
var checker_selected,checker_selected_index;
var backRight,backLeft,forwardLeft,forwardRight;  // toate variantele posibile de mers pt o  dama
var gameOver = 0;
var currentSide;
var lastPiece;
var possibleAttacks=[];
var oldPositions = [];
var anotherMove;
var mustAttack = false;
var done=true;

var stepLength = 1 // 2 daca face saritura 1 in caz contrat


var tableLimit,reverse_tableLimit ,  moveBackLeft,moveBackRight, moveForwarLeft,moveForwarRight , tableLimitLeft, tableLimitRight;


for(var i=0; i<whiteCheckerClass.length;i++){
	whiteCheckerClass[i].addEventListener("click",CheckerOnClick);
}
for(var i=0; i<blackCheckerClass.length;i++){
	blackCheckerClass[i].addEventListener("click",CheckerOnClick);
}

function CheckerOnClick(event){
	findMoves(event.target);
}

for(var i=0;i< field_class.length;i++){
	field_class[i].addEventListener("click", fieldOnClick);
	field_class[i].innerHTML = `<p>${i}<p>`
}

function fieldOnClick(event){
	index=0;
	for(var i=0;i<field_class.length;i++){
		if(field_class[i]==event.target) index = i;
	}
	Move(index);
}

///Field Prototype
var Field = function(field,index){
	this.ID = field;
	this.ocupied = false;
	this.checkerID = undefined;
}

///Checker Prototype
var Checker = function(piece,color,field) {
	this.ID = piece;
	this.color = color;
	this.queen = false;
	this.ocupied_field = field;
	this.jumped = false;
	this.attack = false;
	if(field%8){
		this.posX= field%8;
		this.posY = Math.floor(field/8) + 1 ;
	}
	else{
		this.posX = 8;
		this.posY = field/8 ;
	}
}

Checker.prototype.setPosition = function(){
	var x = (this.posX - 1  ) * moveLength + MoveToCenter;
	var y = (this.posY - 1 ) * moveLength  + MoveToCenter;
	this.ID.style.top = y + 'px';
	this.ID.style.left = x + 'px';
}

Checker.prototype.changePosition = function(X,Y){
	this.posY +=Y;
	this.posX += X;
}

Checker.prototype.checkIfQueen = function () {
	if(this.posY == 8 && !this.queen &&this.color == "black"){
		this.queen = true;
		this.ID.style.border = "5px solid #ff0000";
	}
	if(this.posY == 1 && !this.queen &&this.color == "white"){
		this.queen = true;
		this.ID.style.border = "5px solid #ff0000";
	}
}

//Initialize Field Array
for (var i = 1; i <=64; i++)
	field[i] =new Field(field_class[i],i);

/*==================================================*/

/*----------------*/
// Initialize Table
//damele negre
for (var i = 1; i <= 4; i++){
	BlackCheckerArray[i] = new Checker(blackCheckerClass[i], "black", 2*i -1 ); 
	BlackCheckerArray[i].setPosition();
	field[2*i - 1].ocupied = true;
	field[2*i - 1].checkerID =BlackCheckerArray[i];
}

for (var i = 5; i <= 8; i++){
	BlackCheckerArray[i] = new Checker(blackCheckerClass[i], "black", 2*i);
	BlackCheckerArray[i].setPosition();
	field[2*i].ocupied = true;
	field[2*i].checkerID = BlackCheckerArray[i];
}

for (var i = 9; i <= 12; i++){
	BlackCheckerArray[i] = new Checker(blackCheckerClass[i], "black", 2*i -1);  
	BlackCheckerArray[i].setPosition();
	field[2*i - 1].ocupied = true;
	field[2*i - 1].checkerID = BlackCheckerArray[i];
}

for (var i = 1; i <= 4; i++){
	WhiteCheckerArray[i] = new Checker(whiteCheckerClass[i], "white",56 + 2*i); 
	WhiteCheckerArray[i].setPosition();
	field[56 +  2*i ].ocupied = true;
	field[56 +  2*i ].checkerID =WhiteCheckerArray[i];
}

for (var i = 5; i <= 8; i++){
	WhiteCheckerArray[i] = new Checker(whiteCheckerClass[i], "white",40 +  2*i - 1);  
	WhiteCheckerArray[i].setPosition();
	field[ 40 + 2*i - 1].ocupied = true;
	field[ 40 + 2*i - 1].checkerID = WhiteCheckerArray[i];
}

for (var i = 9; i <= 12; i++){
	WhiteCheckerArray[i] = new Checker(whiteCheckerClass[i], "white", 24 + 2*i); 
	WhiteCheckerArray[i].setPosition();
	field[24 + 2*i ].ocupied = true;
	field[24 + 2*i ].checkerID = WhiteCheckerArray[i];
}


/*----------------*/

currentSide = WhiteCheckerArray;

function findMoves (checker) {
	var match = false;
	mustAttack = false;
	if(checker_selected){ //erase moves for previous selected checker 
			eraseMoves(checker_selected);
	}
	checker_selected = checker;
	var i,j; 
	for ( j = 1; j <= 12; j++){ //check if checker is the right color for the current turn
		if(currentSide[j].ID == checker){
			i = j;
			checker_selected_index = j;
			match = true;
		}
	}

	if(!match)return false; 
		
	attackingPiece = true;
	if(done==false){
		attackingPiece = false;
		for(i=0;i<possibleAttacks.length;i++){
			if(checker_selected.ID==possibleAttacks[i].ID)attackingPiece=true;
		}
	}if(attackingPiece==false)return false;
	
	if(currentSide[i].color =="white"){
		
		tableLimit = 1;
		tableLimitRight = 8;
		tableLimitLeft = 1;
		moveBackRight = -7;
		moveBackLeft = -9;
		moveForwarRight = 9;
		moveForwarLeft = 7;
		reverse_tableLimit = 8;
	}
	else{
		reverse_tableLimit = 1;
		tableLimit = 8;
		tableLimitRight = 1;
		tableLimitLeft = 8;
		moveBackRight = 7;
		moveBackLeft = 9;
		moveForwarRight = -9;
		moveForwarLeft = -7;
	}
//----------------- Check For Attack moves---------------

	attackMoves(currentSide[i]); // Assign UPLeft, backRight, forwardLeft, forwardRight for next function (Move)
 	if(!mustAttack){
 	  forwardLeft = checkMove( currentSide[i] , tableLimit , tableLimitRight , moveBackRight);// downLeft and downRight
		forwardRight = checkMove( currentSide[i] , tableLimit , tableLimitLeft , moveBackLeft);
		if(currentSide[i].queen){
			backLeft = checkMove( currentSide[i] , reverse_tableLimit , tableLimitRight , moveForwarLeft);
			backRight = checkMove( currentSide[i], reverse_tableLimit , tableLimitLeft ,moveForwarRight)
		}
	}

	if(forwardLeft || forwardRight || backLeft || backRight){
			return true;
		}
	return false;

}


function eraseMoves(piece){
	console.log("Erase_Rodes - started");	
	if(forwardRight) field[forwardRight].ID.style.background = "#207644";
	if(forwardLeft) field[forwardLeft].ID.style.background = "#207644";
	if(backRight) field[backRight].ID.style.background = "#207644";
	if(backLeft) field[backLeft].ID.style.background = "#207644";
	console.log("Erase_Rodes - completed");	
}

function Move (index) {
	console.log("Move - started");
	var isMove = false;
	if(!checker_selected){ // Check if any piece was selected 
		checker_selected = undefined;
		return false;
	}
	if(index != backLeft && index != backRight && index != forwardLeft && index != forwardRight){ /* check if an index of a clicked-on field is among the possible moves of the 
		selected piece*/
		eraseMoves(0);
		checker_selected = undefined;
		return false;
	}

	if(currentSide[1].color=="white"){   
		temp_forwardRight = backRight; 
		temp_forwardLeft = backLeft;  
		temp_backLeft = forwardLeft;  
		temp_backRight = forwardRight;
	}
	else{
		temp_forwardRight = backLeft;
		temp_forwardLeft = backRight;
		temp_backLeft = forwardRight;
		temp_backRight = forwardLeft;
	}

	if(mustAttack)  // ca sa stiu daca sar doar un rand sau 2
		stepLength = 2;
	else
		stepLength = 1;

/*---------------------------------------------------------------------------------------*/

	if(index == temp_backLeft){
		isMove = true;
		if(currentSide[1].color=="black"){
			updateTable( stepLength * 1, stepLength * 1, stepLength * 9 );
			if(mustAttack) Jump(index - 9);
		}
		else{
			updateTable( stepLength * 1, stepLength * -1, stepLength * -7);
			if(mustAttack) Jump( index + 7 );
		}
	}

	if(index == temp_backRight){

		isMove = true;
		if(currentSide[1].color=="black"){
			updateTable( stepLength * -1, stepLength * 1, stepLength * 7);
			if(mustAttack)	Jump(index - 7 );
		}
		else{
			updateTable( stepLength * -1, stepLength * -1, stepLength * -9);
			if (mustAttack) Jump( index + 9 );
		}
	}

/*---------------------------------------------------------------------------------------*/

	if(currentSide[checker_selected_index].queen){

		if(index == temp_forwardRight){
			isMove = true;
			if(currentSide[1].color=="black"){
				updateTable( stepLength * 1, stepLength * -1, stepLength * -7);
				if(mustAttack) Jump ( index  + 7) ;//+7
			}
			else{
				updateTable( stepLength * 1, stepLength * 1, stepLength * 9);
				if(mustAttack) Jump ( index  - 9) ;//-9
			}
		}

		if(index == temp_forwardLeft){
			isMove = true;
				if(currentSide[1].color=="black"){
					updateTable( stepLength * -1, stepLength * -1, stepLength * -9);
					if(mustAttack) Jump ( index  + 9) ;//+9
				}
				else{
					updateTable( stepLength * -1, stepLength * 1, stepLength * 7);
					if(mustAttack) Jump ( index  - 7) ;//-7
				}
		}
	}

	eraseMoves(0);
	currentSide[checker_selected_index].checkIfQueen();

	if (isMove) {
		anotherMove = undefined;
		//when the move has occurred, and it was an attakc, check for second possible attack. 
		 if(mustAttack) {
			 	anotherMove = attackMoves(currentSide[checker_selected_index]);
				console.log("AttackMoves - completed");
		 }
		if (anotherMove){
			lastPiece = currentSide[checker_selected_index];
			findMoves(lastPiece);
			console.log("showMove - completed");
		}
		else{
			lastPiece = undefined;
		 	changeTurns(currentSide[1]);
		 	gameOver = checkIfLost();
			console.log("checkIfLost - completed");
		 	if(gameOver){
				 Result();
				 return false;
				}
		}

		//When the move has occurred, check for necessary attacks from the opponent side.
		// var j;
		// for(var i = 0; i<currentSide.length;i++){
		// 	requiredJump = attackMoves(currentSide[i]);
		// 	if(requiredJump){ 
		// 		done=false;
		// 		possibleAttacks.push(currentSide[i].ID)
		// 		j=i;
		// 	}
		// }
	}
	console.log("Move - completed");
}


// -----------Change Checker position on the table--------------

function updateTable (X,Y,fields){
	console.log("updateTable - started");
	currentSide[checker_selected_index].changePosition(X,Y);
	currentSide[checker_selected_index].setPosition();
	field[currentSide[checker_selected_index].ocupied_field].ocupied = false;
	field[currentSide[checker_selected_index].ocupied_field + fields].ocupied = true;
	field[currentSide[checker_selected_index].ocupied_field + fields].checkerID = 	field[currentSide[checker_selected_index].ocupied_field ].checkerID;
	field[currentSide[checker_selected_index].ocupied_field ].checkerID = undefined;
	currentSide[checker_selected_index].ocupied_field += fields;
	console.log("updateTable - completed");
}

function checkMove(checker,limitTop,limitSide,moveDirection){
	var direction;
	if(checker.posY != limitTop){
		if(checker.posX != limitSide && !field[ checker.ocupied_field + moveDirection ].ocupied){
			field[ checker.ocupied_field + moveDirection ].ID.style.background = "#a2edc1";
			direction = checker.ocupied_field + moveDirection;
		}
		else
				direction = undefined;
		}
	else
		direction = undefined;
	return direction;
}



function  checkAttack( check , X, Y , negX , negY, fieldMove){
	var direction;
	console.log("CheckAttack - started");
	if(check.posX * negX >= 	X * negX && check.posY *negY <= Y * negY && field[check.ocupied_field + fieldMove ].ocupied
		 && field[check.ocupied_field + fieldMove].checkerID.color != check.color && !field[check.ocupied_field + fieldMove * 2 ].ocupied){
		mustAttack = true;
		console.log("MUSTATTACK    MUSTATTACKMUSTATTACKMUSTATTACKMUSTATTACKMUSTATTACKMUSTATTACK")
		direction = check.ocupied_field +  fieldMove*2 ;
		field[direction].ID.style.background = "#a2edc1";
		// field[direction].ID.style.background = "#207644";
		return direction ;
	}
	else
		direction =  undefined;
		return direction;
}
//------------------------------------------------------
function attackMoves(checker){
	console.log("AttackMoves - started");
 		backRight = undefined;
 		backLeft = undefined;
 		forwardRight = undefined;
 		forwardLeft = undefined;

 	if(checker.queen){
 		if(checker.color == "white"){
			backRight = checkAttack( checker , 6, 3 , -1 , -1 ,9);//-7
			backLeft = checkAttack( checker, 3 , 3 , 1 , -1 , 7);//-9
		}
		else{
			forwardLeft = checkAttack( checker , 3, 6, 1 , 1 , -9);//7
			forwardRight = checkAttack( checker , 6 , 6 , -1, 1 ,-7);//9
		}
	}
	if(checker.color == "white"){
		backRight = checkAttack( checker , 6, 3 , -1 , -1 , -7);
		backLeft = checkAttack( checker, 3 , 3 , 1 , -1 , -9);
	}
	else{
		forwardLeft = checkAttack( checker , 3, 6, 1 , 1 , 7);
		forwardRight = checkAttack( checker , 6 , 6 , -1, 1 ,9);
	}

 	if(checker.color== "white"&& (backRight || backLeft || forwardLeft || forwardRight ) ) {
	 	var temp = backLeft;
	 	backLeft = forwardLeft;
	 	forwardLeft = temp;

	 	temp = backRight;
	 	backRight = forwardRight;
	 	forwardRight = temp;

	 	temp = forwardLeft ;
	 	forwardLeft = forwardRight;
	 	forwardRight = temp;

	 	temp = backRight ;
	 	backRight = backLeft;
	 	backLeft = temp;
 	}
 	if(backLeft != undefined || backRight != undefined || forwardRight != undefined || forwardLeft != undefined){
 		return true;

 	}
 	return false;
}//----------------------------------------------------------------------

function changeTurns(checker){
	console.log("changeTurns - started");
	if(checker.color=="white"){
		turnDisplay.innerHTML = '<p>Black Turn</p>'
		currentSide = BlackCheckerArray;
		tableLimit = 1;
		tableLimitRight = 8;
		tableLimitLeft = 1;
		moveBackRight = -7;
		moveBackLeft = -9;
		moveForwarRight = 9;
		moveForwarLeft = 7;
		}
		else{
		turnDisplay.innerHTML = '<p>White Turn</p>'
		currentSide = WhiteCheckerArray;
		tableLimit = 8;
		tableLimitRight = 1;
		tableLimitLeft = 8;
		moveBackRight = 7;
		moveBackLeft = 9;
		moveForwarRight = - 9;
		moveForwarLeft = -7;
	} 
}


function Jump(indexx){
	if(indexx < 1 || indexx > 64)
		return  0;

	var x =field[ indexx ].checkerID ;
	x.jumped =true;
	field[ indexx ].ocupied = false;
	x.ID.style.display  = "none";
}

function checkIfLost(){
	console.log("checkIfLost - started");
	var i;
	for(i = 1 ; i <= 12; i++)
		if(currentSide[i].jumped==false)
			return false;
	return true;
}

function Result(){
	if(currentSide[1].color == "white")
		alert("Black wins!");
	else
		alert("White wins!");
}

});