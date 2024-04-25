let crypto = require('crypto');
let table = require('cli-table');
let colors = require('colors');
let readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
class secure_random{
	constructor(){
		this.update();
	}
	update(){
		this.key = crypto.randomBytes(32).toString('hex');
	}
}
class hmac_sha256{
	constructor(message, sr){
		this.update(message,sr.key);
	}
	update(message,key){
		this.hash = crypto.createHmac('sha256', key).update(message).digest('hex');
	}
}
class generator_table{
	constructor(strokes){
		let measurements = [];
		let head_array = ['⌄ PC'.magenta+' / '.white+'USER >'.green];
		measurements.push(14);
		for(let i = 0; i < strokes.length; i++){
			head_array.push(strokes[i].green);
			measurements.push(8);
		}
		this.strokes = strokes;
		this.t = new table({
		head: head_array
  	, 	colWidths: measurements,
  	style: { 'padding-left': 0, 'padding-right': 0 }

		});

	}
	date_stroke(winer){
		if(winer==0){
			return 'WIN'.red;
		}else if(winer==1){
			return 'LOSE'.blue;
		}else if(winer==2){
			return 'DRAW'.yellow;
		}
	}
	write(os){
		let tt = [];
			for(let i = 1; i <= os.quantity; i++){
				tt.push(this.strokes[i-1].magenta);
				for(let j = 1; j <= os.quantity; j++){
					tt.push(this.date_stroke(os.stroke(j,i)));
				}
				this.t.push(tt);
				tt = [];
			}
	}
}
class couter{
	constructor(){
		this.t= new table({
			head: ['USER'.green,'PC'.magenta],
			colWidths: [15,15]
		});
		this.user1 = 0;
		this.user2 = 0;
		this.update();
	}
	update(){
		this.t.push([String(this.user1).green,String(this.user2).magenta]);
	}
	plus(winer){
		if(winer==1){
			this.t[this.t.length-1] = ['WIN'.red, 'LOSE'.blue];
			this.user1++;
		}else if(winer == 0){
			this.t[this.t.length-1] = ['LOSE'.blue, 'WIN'.red];
			this.user2++;
		}else if(winer == 2){
			this.t[this.t.length-1] = ['DRAW'.yellow, 'DRAW'.yellow];
		}
		this.update();
	}
}
class order_stroke{
	constructor(quantity){
		this.quantity = quantity;
	}

	stroke(f,s){
		if(f == s){
			return 2;
		}
		if(Math.min(f,s)<1 || Math.max(f,s)>this.quantity){
			return -1;
		}
		if(Math.min(Math.abs(f-s))<=Math.floor(this.quantity/2)){
			if(f<s) return 1;
			else return 0;
		}else{
			if(f<s)return 0;
			else return 1;
		}
	}
}
class game{
	constructor(){
		this.strokes = process.argv.slice(2);
		this.os = new order_stroke(this.strokes.length);
		if(!this.check_error()) this.close();

		this.t = new generator_table(this.strokes);
		this.t.write(this.os);
		this.c = new couter();
		this.sr = new secure_random();
		this.st = Math.floor(Math.random()*this.os.quantity);
		//console.log(this.sr.key, this.sr);
		this.hs = new hmac_sha256(this.strokes[this.st], this.sr);
		//stroke();
	}
	close(){
		rl.close();
		process.exit();
	}
	check_error(){
		if(this.os.quantity == 0){
			console.log('Error: You didn`t write arguments');
			return 0;
		}else if(this.os.quantity%2==0){
			console.log('Error: Number of arguments doesn`t must to be even');
			return 0;
		}else{
			let f = false;
			for(let i = 0; i < this.strokes.length; i++){
				if(f) break;
				for(let j = 0; j < this.strokes.length; j++){
					if(i!=j && this.strokes[i] == this.strokes[j]) f = true;
					if(f) break;
				}
			}
			if(f) {
				console.log('Error: The elements should not be repeated');
				return 0;
			}
		}
		return 1;
	}

	end(winer){
		console.log('Computer move:'.yellow, this.strokes[this.st])
		if(winer==0){
			console.log('Congratulation!!! You won!'.red);
			this.c.plus(1);
		}else if(winer==1){
			console.log('You lost... Have another try!'.blue);
			this.c.plus(0);
		}else if(winer==2){
			console.log('It`s a draw. A freindship won!'.yellow);
			this.c.plus(2);
		}
		console.log('HMAC key:', this.sr.key);
	}
	read(){
		rl.question('Enter your move: ', (input) => {

    		if(Number(input)<=this.os.quantity && Number(input)>0){
    				console.log('Your move:'.yellow, this.strokes[input-1]);
    				this.end(this.os.stroke(input, this.st+1));
    				this.st = Math.floor(Math.random()*this.os.quantity);
    				this.sr.update();
    				this.hs.update(this.strokes[this.st],this.sr.key);

    		}else if(Number(input) == '0'){
    			this.close();
    		}else if(input == '?'){
    			this.help();
    		}else if(input =='+'){
    			this.couter();
    		}else{
    			console.log('It isn`t available move')
    		}
    			console.log('\n');
    			this.stroke();
		});
	}
	stroke(){
		console.log("HMAC:",this.hs.hash);
		console.log("Available moves:");
		for(let i = 0; i < this.os.quantity; i++){
			console.log(i+1,'-',this.strokes[i]);
		}
		console.log('0 - exit');
		console.log('? - help');
		console.log('+ - couter')
		rl.close;
		this.read();
	}
	couter(){
		console.log(this.c.t.toString());
	}
	help(){
			console.log(this.t.t.toString());
	}

}


//console.log(sr.key, hs.hash);
let g = new game();
g.stroke();
//g.read();
//console.log(t.t.toString());