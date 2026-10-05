using UnityEngine;
using ScooterMayhem.Game;

namespace ScooterMayhem.Traffic
{
    public enum StreetHogType
    {
        BrokenOfficeChair,
        CementPaintBucket,
        PottedPlantsChained
    }

    [RequireComponent(typeof(Rigidbody), typeof(Collider))]
    public class StreetHogObstacle : MonoBehaviour
    {
        [Header("Obstacle Settings")]
        public StreetHogType hogType = StreetHogType.BrokenOfficeChair;
        public int comboScore = 400;
        public float knockImpulse = 8f;

        private bool cleared = false;
        private Rigidbody rb;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (cleared) return;

            if (collision.gameObject.CompareTag("Player"))
            {
                cleared = true;

                // Funny physics knockback
                Vector3 knockDir = (transform.position - collision.transform.position).normalized + Vector3.up * 0.4f;
                rb.AddForce(knockDir * knockImpulse, ForceMode.Impulse);
                rb.AddTorque(Random.insideUnitSphere * 15f, ForceMode.Impulse);

                // Award combo points & milestone
                Debug.Log($"<color=#00E5FF>【掃除違規路霸】+{comboScore} PTS！路霸退散！</color>");
                AchievementSystem.Instance?.AddProgress("STREET_CLEANER", 1);
            }
        }
    }
}
