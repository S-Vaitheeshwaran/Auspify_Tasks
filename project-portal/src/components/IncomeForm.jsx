import { X } from "lucide-react";

function IncomeForm({
  formData,
  editing,
  saving,
  fieldErrors,
  maxDate,
  onChange,
  onSubmit,
  onClose,
}) {
  const inputClass = (field) =>
    `form-input${fieldErrors[field] ? " input-error" : ""}`;

  const renderFieldError = (field) =>
    fieldErrors[field] ? (
      <small className="field-error">{fieldErrors[field]}</small>
    ) : null;

  return (
    <div className="modal-overlay">
      <div className="expense-modal">
        <div className="modal-header">
          <div>
            <h2>{editing ? "Update Income" : "Add New Income"}</h2>
            <p>Enter your income information.</p>
          </div>

          <button className="close-btn" onClick={onClose} type="button">
            <X />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label>Income Title *</label>
              <input
                className={inputClass("title")}
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Example: Monthly Salary"
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {renderFieldError("title")}
            </div>

            <div className="form-group">
              <label>Amount *</label>
              <input
                className={inputClass("amount")}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                aria-invalid={Boolean(fieldErrors.amount)}
              />
              {renderFieldError("amount")}
            </div>

            <div className="form-group">
              <label>Income Category *</label>
              <select
                className={inputClass("category")}
                name="category"
                value={formData.category}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.category)}
              >
                <option value="">Select Category</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Business">Business</option>
                <option value="Investment">Investment</option>
                <option value="Bonus">Bonus</option>
                <option value="Gift">Gift</option>
              </select>
              {renderFieldError("category")}
            </div>

            <div className="form-group">
              <label>Income Date *</label>
              <input
                className={inputClass("incomeDate")}
                type="date"
                name="incomeDate"
                value={formData.incomeDate}
                max={maxDate}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.incomeDate)}
              />
              {renderFieldError("incomeDate")}
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                className={inputClass("paymentMethod")}
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={onChange}
                aria-invalid={Boolean(fieldErrors.paymentMethod)}
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
              {renderFieldError("paymentMethod")}
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                className={inputClass("description")}
                name="description"
                value={formData.description}
                onChange={onChange}
                rows="2"
                maxLength={255}
                placeholder="Income description"
                aria-invalid={Boolean(fieldErrors.description)}
              />
              {renderFieldError("description")}
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                className={inputClass("notes")}
                name="notes"
                value={formData.notes}
                onChange={onChange}
                rows="2"
                maxLength={255}
                placeholder="Additional notes"
                aria-invalid={Boolean(fieldErrors.notes)}
              />
              {renderFieldError("notes")}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editing
                  ? "Update Income"
                  : "Save Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncomeForm;