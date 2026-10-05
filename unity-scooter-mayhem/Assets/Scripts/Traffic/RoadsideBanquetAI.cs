using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// RoadsideBanquetAI (廟口路邊辦桌流水席紅圓桌路障與飛散龍蝦冷盤)
    /// Models the iconic Taiwanese outdoor roadside banquet taking over street lanes:
    /// - Striped canvas canopy tent, festive lanterns, red folding round tables, plastic round stools.
    /// - High-speed slicing through narrow gap awards "【鑽流水席棚架車神！】" (+1200 PTS).
    /// - Crashing into banquet flips tables, shatters dishes (lobster platter, crab sticky rice),
    ///   scatters props, and incurs a $400 chef compensation fee.
    /// </summary>
    public class RoadsideBanquetAI : MonoBehaviour
    {
        [Header("Banquet Bounds & Gap")]
        [SerializeField] private Vector3 banquetCenter = new Vector3(3.4f, 0f, 48f);
        [SerializeField] private float tentWidth = 4.6f;
        [SerializeField] private float tentLength = 6.2f;
        [SerializeField] private Vector2 gapXRange = new Vector2(0.4f, 1.6f);

        [Header("Physics Props")]
        [SerializeField] private Rigidbody[] tableRigidbodies;
        [SerializeField] private Rigidbody[] stoolRigidbodies;

        [Header("Audio & FX")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip dishesClatterClip;
        [SerializeField] private ParticleSystem foodSplatterFX;

        // State tracking
        private bool dodgeAwarded = false;
        private bool crashAwarded = false;
        private float cooldownTimer = 0f;

        public event Action<string, int> OnBanquetDriftSuccess;
        public event Action<string, int> OnBanquetCrashed;

        private void Update()
        {
            if (cooldownTimer > 0f)
            {
                cooldownTimer -= Time.deltaTime;
                if (cooldownTimer <= 0f)
                {
                    dodgeAwarded = false;
                    crashAwarded = false;
                }
            }
        }

        /// <summary>
        /// Evaluated per frame by TrafficManager
        /// </summary>
        public void UpdateBanquet(float dt, Vector3 playerPos, float playerSpeedKmH, bool isPlayerCrashed)
        {
            if (cooldownTimer > 0f) return;

            float dist = Vector3.Distance(banquetCenter, playerPos);

            // 1. Threading the needle through the narrow gap between tent and road divider
            if (!dodgeAwarded && !crashAwarded)
            {
                bool inGapZ = Mathf.Abs(playerPos.z - banquetCenter.z) < 3.2f;
                bool inGapX = playerPos.x >= gapXRange.x && playerPos.x <= gapXRange.y;

                if (inGapZ && inGapX && playerSpeedKmH > 22f)
                {
                    dodgeAwarded = true;
                    cooldownTimer = 12.0f;
                    OnBanquetDriftSuccess?.Invoke("【鑽流水席棚架車神！】極限穿梭！", 1200);
                }
            }

            // 2. Crashing directly into banquet tables
            if (!crashAwarded && dist < 2.5f && !isPlayerCrashed)
            {
                crashAwarded = true;
                cooldownTimer = 15.0f;

                ScatterProps();

                if (audioSource != null && dishesClatterClip != null)
                {
                    audioSource.PlayOneShot(dishesClatterClip);
                }

                if (foodSplatterFX != null)
                {
                    foodSplatterFX.Play();
                }

                OnBanquetCrashed?.Invoke("【撞翻路邊辦桌流水席】賠償總鋪師 $400！", 400);
            }
        }

        public void ScatterProps()
        {
            if (tableRigidbodies != null)
            {
                foreach (var rb in tableRigidbodies)
                {
                    if (rb != null)
                    {
                        rb.isKinematic = false;
                        Vector3 force = (UnityEngine.Random.insideUnitSphere + Vector3.up * 1.5f) * 12f;
                        rb.AddForce(force, ForceMode.Impulse);
                        rb.AddTorque(UnityEngine.Random.insideUnitSphere * 8f, ForceMode.Impulse);
                    }
                }
            }

            if (stoolRigidbodies != null)
            {
                foreach (var rb in stoolRigidbodies)
                {
                    if (rb != null)
                    {
                        rb.isKinematic = false;
                        Vector3 force = (UnityEngine.Random.insideUnitSphere + Vector3.up * 1.8f) * 10f;
                        rb.AddForce(force, ForceMode.Impulse);
                        rb.AddTorque(UnityEngine.Random.insideUnitSphere * 10f, ForceMode.Impulse);
                    }
                }
            }
        }
    }
}
