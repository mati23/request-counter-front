import React, { useState, useEffect } from 'react'
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { Feature, FeatureCollection, Geometry } from 'geojson'
//import './WorldMap.scss'

const uuid = require('react-uuid')

const scale = 200
const cx = 400
const cy = 150

var countries =  [
{countryName: "ap-northeast-3" ,id:"392",counter:0},
{countryName: "ap-northeast-2" ,id:"410",counter:0},
{countryName: "ap-southeast-1" ,id:"702",counter:0},
{countryName: "ap-southeast-2" ,id:"036",counter:0},
{countryName: "ap-northeast-1" ,id:"392",counter:0},
{countryName: "af-south-1"     ,id:"710",counter:0},
{countryName: "ca-central-1"   ,id:"124",counter:0},
{countryName: "cn-north-1"     ,id:"156",counter:0},
{countryName: "cn-northwest-1" ,id:"158",counter:0},
{countryName: "eu-central-1"   ,id:"276",counter:0},
{countryName: "eu-west-1"      ,id:"372",counter:0},
{countryName: "eu-west-2"      ,id:"826",counter:0},
{countryName: "eu-south-1"     ,id:"380",counter:0}, 
{countryName: "eu-west-3"      ,id:"250",counter:0},
{countryName: "eu-north-1"     ,id:"752",counter:0},
{countryName: "me-south-1"     ,id:"682",counter:0},
{countryName: "sa-east-1"      ,id:"076",counter:0},
{countryName: "us-east-1"      ,id:"840",counter:0},
{countryName: "us-east-2"      ,id:"840",counter:0}
];

const printValues = (d,i,geographies, countries) =>{
  //`rgba(38,50,56,${(1 / (geographies ? geographies.length : 0)) * i})`;    
  
    var exists = countries.some((item)=>{ return item.id === d.id});
    
    if(exists === true){
      countries.forEach((item)=>{
        if (item.id===d.id) item.counter = item.counter+1
      })
      return `rgba(255,50,56,1)`
    }
    return `rgba(38,50,56,1)`;
}

function perc2color(perc) {
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

const WorldMapAtlas = () => {
    const [countryIds, setCountryIds] = useState(countries)
    const [geographies, setGeographies] = useState([])
    const [counter, setCounter] = useState([])
   
    useEffect(() => {
      fetch('/data/s3data.json').then((response) => {
        if (response.status !== 200) {
          
          return
        }
        response.json().then((s3Data) => {                        
          let newCountries = countries;
          s3Data.map((s3item)=>{            
            newCountries.some((countryItem)=>{              
              if(s3item.region === countryItem.countryName){
                countryItem.counter = countryItem.counter+1;                
              }
            })
            setCounter(newCountries);          
          })
          
        })
      })
    }, [])

    useEffect(()=>{
      console.log(counter);
    },[setCounter])
  
    const fill = ( d ) =>{ 
                 
      var exists = counter.some((item)=>{ return item.id === d.id});
      if(exists === true){        
        let itemCounter = counter.find((item)=>{
          return item.id === d.id
        })
        
        return perc2color(itemCounter.counter*1.2);
      }
      return 'rgba(38,50,56,1)';
    }

    useEffect(() => {
        fetch('/data/world-110m.json').then((response) => {
          if (response.status !== 200) {
            
            return
          }
          response.json().then((worldData) => {            
            const mapFeatures = ((feature(worldData, worldData.objects.countries))).features
            setGeographies(mapFeatures)
          })
        })
      }, [])

      
      const projection = geoEqualEarth().scale(scale).translate([cx, cy]).rotate([0, 0])
      return (
        <>
          <svg width="100%"height="100%" viewBox="0 -150 950 600">
            <g>
              {(geographies).map((d, i) => (
                <path
                  key={`path-${uuid()}`}
                  d={geoPath().projection(projection)(d) }
                  fill={fill(d)}
                  stroke="aliceblue"
                  strokeWidth={0.5}
                />
              ))}
            </g>
          </svg>
        </>
      )
    }
    
    export default WorldMapAtlas