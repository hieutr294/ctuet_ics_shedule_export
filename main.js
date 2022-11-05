import axios from 'axios'
import cheerio from 'cheerio'
import ics from 'ics'
import {writeFile} from 'fs'

let uniqueId = 'uN3REj9bZGKJ59hQw5CQEteV1HQzUf4DzA1Oxu58B8w' // Relpace with your id

let ics_array_data = []

let timeArr = {
    1:{
        start:[7,0],
        end:[7,50],
    },
    2:{
        start:[7,50],
        end:[8,40],
    },
    3:{
        start:[8,55],
        end:[9,45],
    },
    4:{
        start:[9,45],
        end:[10,35],
    },
    5:{
        start:[10,40],
        end:[11,30],
    },
    6:{
        start:[13,20],
        end:[14,10],
    },
    7:{
        start:[14,10],
        end:[15,0],
    },
    8:{
        start:[15,15],
        end:[16,5],
    },
    9:{
        start:[16,5],
        end:[16,55],
    },
    10:{
        start:[17,0],
        end:[17,50],
    },
    11:{
        start:[18,20],
        end:[19,10],
    },
    12:{
        start:[19,10],
        end:[20,0],
    },
    13:{
        start:[20,5],
        end:[20,55],
    },
}

function get_ics_array_data(data){
    const $ = cheerio.load(data)
    $('.table-responsive').find('thead').find('tr').find('th').each((dateIndex,dateContent)=>{
        if(dateIndex>0){
            $('.table-responsive').find('table').find('tbody').find('tr').each((trIndex,trElement)=>{
                $(trElement).find('td').each((tdIndex,tdContent)=>{
                    if(dateIndex==tdIndex){
                        let subject = ''
                        $(tdContent).find('div').find('b').each((bIndex,bContent)=>{
                            subject = $(bContent).text()
                        })

                        $(tdContent).find('div').find('p').each((pIndex,pContent)=>{
                            if(pIndex==1){
                                let startTime = timeArr[$(pContent).text().trim().split('\n')[0].slice(6,100).split(' - ')[0]].start
                                let endTime = timeArr[$(pContent).text().trim().split('\n')[0].slice(6,100).split(' - ')[0]].end
                                ics_array_data.push({
                                    title: subject,
                                    location: $(pContent).text().trim().split('\n')[1].trim(),
                                    start:$(dateContent).text().slice(-10).split('/').map((val,index)=>parseInt(val)).reverse().concat(startTime),
                                    end: $(dateContent).text().slice(-10).split('/').map((val,index)=>parseInt(val)).reverse().concat(endTime)
                                }) 
                            }
                        })


                    }
                })
                
            })
        }
    })
    genarate_ics_file(ics_array_data)

}

function genarate_ics_file(ics_array_data){
  ics.createEvents(ics_array_data,(err,value)=>{
    if(err){
      console.log(err)
    }else{
      writeFile('./event.ics',value,(err)=>{
        if(err){
          console.log(err)
        }else{
          console.log('Write to file: Done')
        }
      })
    }
  })
}

function getLichHoc(){
  axios({
    method:'post',
    url:'https://sinhvien.ctuet.edu.vn/SinhVienTraCuu/GetDanhSachLichTheoTuan',
    data:{ 
        k: uniqueId, 
        pNgayHienTai: '7/11/2022', 
        pLoaiLich : 0
    }
  })
  .then(val=>{
    const $ = cheerio.load(val.data)
    get_ics_array_data($.html())
  })
}

getLichHoc()