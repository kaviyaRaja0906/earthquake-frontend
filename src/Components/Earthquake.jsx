import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { Icon } from 'leaflet';
import markerIcon from '../assets/earthquake.png';
import logo from "../assets/logo.png";

function createCustomIcon() {
  return new Icon({
    iconUrl: markerIcon,
    iconSize: [40, 40], 
  });
}

function Earthquake() {
  const [earthQuakeData, setEarthQuakeData] = useState([]);
  const [selectedDepth, setSelectedDepth] = useState(null);
  const [filteredQuakes, setFilteredQuakes] = useState([]);
  const [selectedMagnitude, setSelectedMagnitude] = useState(null);
  const [magnitudes, setMagnitudes] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  function getMonth(data){
    return new Date(data).toLocaleDateString('en-US', { month: 'long' });
  }
  
  function getDate(data){
    return new Date(data).getDate();
  }

  function getYear(data){
    return new Date(data).getFullYear();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataStored = localStorage.getItem('dataStored');
        if (!dataStored) {
          const response = await axios.get('http://localhost:5000/getData');
          const data = response.data;

          console.log(data);
          const features = data.features;
          const storeDataResponse = await axios.post('http://localhost:5000/storeData', {
            features,
          });

          console.log(storeDataResponse);

          localStorage.setItem('dataStored', 'true');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

  }, []);

  useEffect(() => {
    const fetchEarthquakeData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/earthquakes');
        const data = response.data;
        setEarthQuakeData(data);

        const uniqueMagnitudes = [...new Set(data.map(quake => quake.properties.magnitude))];
        setMagnitudes(uniqueMagnitudes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEarthquakeData();

  }, []);

  useEffect(() => {
    const filterQuakes = () => {
      let filteredData = earthQuakeData;
      if (!selectedDepth) {
        setFilteredQuakes(earthQuakeData);
      } else {
        filteredData = earthQuakeData.filter((quake) => {
          if (selectedDepth === 'shallow') {
            return quake.properties.depth < 70;
          } else if (selectedDepth === 'intermediate') {
            return quake.properties.depth >= 70 && quake.properties.depth <= 300;
          } else if (selectedDepth === 'deep') {
            return quake.properties.depth > 300;
          }
          return true;
        });
      }
      if (selectedMagnitude) {
        filteredData = filteredData.filter(
          (quake) => quake.properties.magnitude === parseFloat(selectedMagnitude)
        );
      }
      setFilteredQuakes(filteredData);
      if (filteredData.length === 0) {
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }
    };
    
    

    filterQuakes();

  }, [selectedDepth, earthQuakeData]);

  const showAllRecords = () => {
    setSelectedDepth(null);
    setSelectedMagnitude(null);
    setFilteredQuakes(earthQuakeData);
  };

  return (
    <div id="map">
      <div className="map-desc">
      <div style={{ pointerEvents: showAlert ? 'none' : 'auto' }}>
      <div className="logo">
          <img className="logo-img" src={logo} alt=""></img>
        </div>
        <div className="records">
        <p className="record-p">
        QuakeVisio provides intuitive earthquake reports based on specific criteria such as location, magnitude, depth, and time of occurrence
        </p>
        <div className="report">
        <i>
         <h2 class="headline">Report:</h2>
         <p class="report-text">
          "<b className="highlight t">T</b>he earthquake data from Indonesia includes moderate to strong earthquakes ranging in magnitude from <b class="highlight">2.6 to 6.4</b>. The depths of the earthquakes vary between <b class="highlight">3 km and 162 km</b>, with a mix of offshore and onshore occurrences. The affected regions include <b className="highlight">Sumbawa, Bantul, Morowali Utara, Bengkulu Tengah, Tapanuli Utara, Banggai Kepulauan, Jayapura, Keerom, Pontianak, and Kab. Jayapura.</b>"
         </p>
        </i>
       </div>
        </div>
        <hr className="hr"></hr>
        <h3 className="props">Depth</h3>
        <div className="Depth">
          <div className="tiles shallow" onClick={() => setSelectedDepth('shallow')}>
            shallow<br></br>
            <i className="fa-solid fa-less-than"></i>70km
          </div>
          <div className="tiles shallow" onClick={() => setSelectedDepth('intermediate')}>
            Intermediate<br></br>
            70-300km
          </div>
          <div className="tiles shallow" onClick={() => setSelectedDepth('deep')}>
            Deep<br></br>
            <i className="fa-solid fa-greater-than"></i>300km
          </div>
        </div>
        <div className="desc">
        <i class="fa-solid fa-circle-info"></i>  The distance between the earthquake's focus (the point within the Earth where the seismic energy is released) and the Earth's surface
        </div>
        <hr className="hr"></hr>
        <h3 className="props">Magnitude</h3>
        <div className="magnitude">
        <select className="select" onChange={(e) => setSelectedMagnitude(e.target.value)}>
            <option value="">All</option>
            {magnitudes.map((magnitude) => (
              <option value={magnitude} key={magnitude}>{magnitude}</option>
            ))}
          </select>
        </div>
        <div className="desc">
        <i class="fa-solid fa-circle-info"></i>  The measure of the energy released during an earthquake.  It quantifies the size or strength of an earthquake based on the amplitude of seismic waves recorded by seismographs.
        </div>
        <hr className="hr"></hr>
      </div>
        <div className="btn-div">
        <button className="record-btn" onClick={showAllRecords}>Show all the records</button>
        </div>
      </div>
      <MapContainer center={[-0.45, 125.44]} zoom={5} scrollWheelZoom={true} style={{ pointerEvents: showAlert ? 'none' : 'auto' }}>
      {showAlert && (
        <div className="alert">
        <span className="close-btn" onClick={showAllRecords}>X</span>
          No results found.
        </div>
      )}
      <TileLayer
         attribution='&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
       {filteredQuakes.map((quake) => {
         if (selectedMagnitude && quake.properties.magnitude !== parseFloat(selectedMagnitude)) {
          return null;
        }

    return (
      <Marker
        key={quake.properties.id}  
        position={[
          quake.properties.latitude,
          quake.properties.longitude
        ]}
        icon={createCustomIcon()}
      >
        <Popup>
          <h6 className="popup-txt">
            Earthquake recorded on {getMonth(quake.properties.dateTime)} {getDate(quake.properties.dateTime)}, {getYear(quake.properties.dateTime)}, had a depth of {quake.properties.depth} and magnitude of {quake.properties.magnitude} in {quake.properties.region}
          </h6>
        </Popup>
      </Marker>
    );
  })}
</MapContainer>

    </div>
  );
}

export default Earthquake;
