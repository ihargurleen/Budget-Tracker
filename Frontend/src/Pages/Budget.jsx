import {useEffect, useState} from 'react';
import apiClient from '../ApiClient/interceptor';
import { useNavigate } from 'react-router-dom';

const Budget = () => {
  const navigate=useNavigate();
  const [budget, setBudget] = useState([]);
  const getBudget = async ()  =>{
    try{
           //api call
           const response = await apiClient.get("/budget/get");
           setBudget(response.data.data);
    }catch(error){
      console.log(error.message)
    }
  }

  useEffect(()=>{
    getBudget();
  },[]);

  console.log(budget, "test");

  const handleClick = (budgetId) =>{
    console.log(budgetId, "clicked");
    navigate(`/budget/${budgetId}`)
  };

  return (
    <div className='budget-page'>
      <h1>Budget listing</h1>

      {budget.map((bud) => {
        return (
          <div className='budget-card' key={bud._id}
            onClick={() =>{
              handleClick(bud._id)
            }}>

            {""}
            <h2>Category: {bud.category.category}</h2>
            <p>Price:{bud.amount}</p>
            <p>Month: {bud.month}</p>
            <p>Year: {bud.year}</p>

          </div>
        )
      })}
    </div> 
  );
};

export default Budget;