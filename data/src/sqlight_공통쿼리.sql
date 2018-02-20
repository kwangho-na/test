select * from cmsFunc where funcName in (
  select funcName from (
         select funcName, count(1) as cnt from cmsFunc group by funcName
  ) X 
  where cnt>1

)
order by funcName