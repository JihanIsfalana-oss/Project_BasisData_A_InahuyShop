import { useState } from 'react'

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const submit = async (event) => {
    event.preventDefault()
    try {
      await onSubmit({ rating, comment })
      setComment('')
    } catch (reason) {
      setError(reason.message)
    }
  }
  return (
    <form className="review-form" onSubmit={submit}>
      <label htmlFor="review-rating">
        Rating
        <select
          id="review-rating"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} bintang
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="review-comment">
        Komentar
        <textarea
          id="review-comment"
          maxLength="5000"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Kirim ulasan</button>
    </form>
  )
}
