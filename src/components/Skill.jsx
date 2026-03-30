/**
 * @fileoverview Skill component for displaying technology tags.
 *
 * Renders a list of skill labels as pill-shaped badges.
 * Used in experience and project cards to show relevant technologies.
 */

import styles from './Skill.module.css'

/**
 * Skill pill labels in a flex-wrap grid.
 *
 * @param {object} props
 * @param {string[]} props.items - Array of skill names
 */
function Skill({ items }) {
  return (
    <div className={styles.grid}>
      {items.map(item => (
        <span key={item} className={styles.skill}>{item}</span>
      ))}
    </div>
  )
}

export { Skill }
