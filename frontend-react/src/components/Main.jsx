 import React from 'react'
 import Button from './Button'

 const Main = () => {
   return (
     <>
     
         <div className='container'>
            <div className='p-5 text-center bg-light-dark rounded'>
                <h1 className='text-light'>Stock Prediction Portal</h1>
                <p className='text-light lead'>Predict the stock prices using Machine Learning</p>
                <Button text='Login' class='btn-success' />
            </div>

         </div>
     
     </>
   )
 }
 
 export default Main