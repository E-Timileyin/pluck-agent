import './ConductRules.css';

/** The four rules from slides 10 and 14 that carry real consequence. */
export const CONDUCT_RULES = [
  'Customer payments go only into company-approved accounts, never a promoter’s personal account.',
  'Asset recovery follows company-approved procedure only — never force, threats or intimidation.',
  'Customer data is protected; breaches carry penalties.',
  'Products and repayment terms are explained honestly.',
];

export function ConductRules() {
  return (
    <ul class="rules">
      {CONDUCT_RULES.map((rule) => (
        <li>{rule}</li>
      ))}
    </ul>
  );
}

export default ConductRules;
