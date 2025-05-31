import {useEffect, useState } from 'react'
import axiosInstance from '../axiosInstance';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';




const Dashboard = () => {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [plot, setPlot] = useState();
  const [ma100, setMA100] = useState();
  const [ma200, setMA200] = useState();
  const [prediction, setPrediction] = useState();
  const [mse, setMSE] = useState();
  const [rmse, setRMSE] = useState();
  const [r2, setR2] = useState();
 
  useEffect(() => {
  const fetchProtectedData = async () => {
    try{
      const response = await axiosInstance.get('/protected-view/');
      //console.log('Success:', response.data);
    }catch(error){
      console.error('Error fetching  data:', error);
    }
  }
  fetchProtectedData();
 }, [])


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  try{
    const response = await axiosInstance.post('/predict/', { 
      ticker: ticker 
    });
    console.log(response.data);
    const backendRoot = import.meta.env.VITE_BACKEND_ROOT
    const plotUrl = `${backendRoot}${response.data.plot_img}`;
    const ma100Url = `${backendRoot}${response.data.plot_100_dma}`;
    const ma200Url = `${backendRoot}${response.data.plot_200_dma}`;
    const predictionUrl = `${backendRoot}${response.data.plot_prediction}`;
    
    // Set plots and metrics to state
    setPlot(plotUrl); // Set plot URL to state
    setMA100(ma100Url); // Set 100-day moving average plot URL to state
    setMA200(ma200Url); // Set 200-day moving average plot URL to state
    setPrediction(predictionUrl); // Set prediction plot URL to state
    setMSE(response.data.mse); // Set MSE to state
    setRMSE(response.data.rmse); // Set RMSE to state
    setR2(response.data.r2); // Set R^2 to state
    
    if(response.data.error) {
      setError(response.data.error);
    }
  }catch(error){
    console.error('There was an error making te API requst', error);
  }finally{
    setLoading(false);
  }
}


  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md-6 mx-auto'>
          <form onSubmit={handleSubmit}>
              <input type="text" className='form-control' placeholder='Enter Stock Ticker' 
              onChange={(e) => setTicker(e.target.value)} required
              />
              <small>{error && <div className='alert alert-danger py-1 px-2 my-1' role='alert'>{error}</div>}</small>
            <button type='submit' className='btn btn-info mt-3'>
              {loading ? <span><FontAwesomeIcon icon={faSpinner} spin/>Please Wait...</span>: 'See prediction'}
            </button>
          </form>
        
        {/* Print prediction plots */}
        {prediction && ( 
          <>
          <div className='prediction mt-5'>
          <div className="p-1">
            {plot && (
                   <img src={plot} style ={{ maxWidth: '120%'}}/>
            )}

          </div>

            <div className="p-1">
            {ma100 && (
                   <img src={ma100} style ={{ maxWidth: '120%'}}/>
            )}
            </div>

            <div className="p-1">
            {ma200 && (
                   <img src={ma200} style ={{ maxWidth: '120%'}}/>
            )}
            </div>
        </div>
             <div className="p-1">
            {prediction && (
                   <img src={prediction} style ={{ maxWidth: '120%'}}/>
            )}
            </div>
            <div className="text-light p-1">
              <h4>Model Evaluation</h4>
              <p> Mean Squared Error (MSE): {mse}</p>
              <p> Root Mean Squared Error (RMSE): {rmse}</p>
              <p> R-squared: {r2}</p>
            </div>
          </>  
        
        )}
       
        </div>
      </div>
    </div>
  )
}

export default Dashboard