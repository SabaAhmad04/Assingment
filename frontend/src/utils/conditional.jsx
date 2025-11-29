export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true; 
  }

  const { logic = "AND", conditions } = rules;

  const evalCondition = (cond) => {
    const { questionKey, operator, value } = cond;
    const answer = answersSoFar ? answersSoFar[questionKey] : undefined;

    if (answer === undefined || answer === null) return false;

    switch (operator) {
      case "equals":
        return answer === value;
      case "notEquals":
        return answer !== value;
      case "contains":
        if (Array.isArray(answer)) {
          return answer.includes(value);
        }
        if (typeof answer === "string") {
          return answer.toLowerCase().includes(String(value).toLowerCase());
        }
        return false;
      default:
        return false;
    }
  };

  if (logic === "OR") {
    return conditions.some(evalCondition);
  }

  return conditions.every(evalCondition); 
}
