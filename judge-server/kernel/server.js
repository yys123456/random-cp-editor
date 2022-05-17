const http = require('http')
const port = 3000

const {exec} = require('child_process');
const fs = require('fs');

let input = "./cpp/a.in"
let output = "./cpp/a.out"
let code = "./cpp/a.cpp"
let compile = "g++ ./cpp/a.cpp -o ./cpp/a"
let cmd = "./oj ./cpp/a 1000 65535 ./cpp/a.in ./cpp/a.out"
let erroc = 0;


function jsonConcat(o1, o2) {
	for (var key in o2) {
		o1[key] = o2[key];
 	}
 	return o1;
}


const server = http.createServer(function(req, res){
	res.writeHead(200, { 'Content-type': 'text/html;charset=utf-8' })
	let data = '';
  	req.on('data', chunk => {
    		data += chunk;
  	})

	erroc = 0;

  	req.on('end', () => {
		let data_json = JSON.parse(data);
		fs.writeFile(code, data_json.code, err => {
			if (err) {
    				console.error(err)
    				return
			}
			fs.writeFile(input, data_json.input, err => {
                        	if (err) {
                                	console.error(err)
                                	return
                        	}
				exec(compile, (err, stdout, stderr) => {
					if(err){
						erroc = 1;
						res.end(`${stderr}`)
						return;
					}
					if(erroc == 0)
					exec(cmd, (err, stdout, stderr) => {
						if(err){
							erroc = 1;
							res.end(`${stderr}`)
							return;
						}
						fs.readFile(output, 'utf-8', (err, data) => {
					  		if(err){
								erroc = 1;
								res.end(`${err}`)
								return;
					  		}
							
							json1 = JSON.parse(`${stdout}`)
							//json1 = {status:'1', timeUsed:'2', memoryUsed:'3'}
							json2 = {output: data}

							//console.log(`${stdout}`)
							
							ans = jsonConcat(json1, json2);
							//console.log(ans)
							if(erroc == 0)
								res.end(JSON.stringify(ans));	
    						});
						//res.end(`${stdout}`)
					})
				})
                	})
		})
  	})	
})

server.listen(port, function(error){
	if(error){
		console.log("WRONG");
	}else{
		console.log("LISTEN TO" + port);
	}
})



