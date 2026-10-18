// The server's message for one field, from fieldErrors().
export default function FieldError({ errors, name }) {
  return errors[name] ? <span className="field-error">{errors[name]}</span> : null;
}
