using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// TainanMobiusRoundaboutAI (台南東門圓環「莫比烏斯迷走」路況機制)
    /// Models the notorious 6-way radial multi-exit roundabout in Tainan City:
    /// - Central raised green island with historic monument & tropical foliage.
    /// - Radial signage for 6 exits (府前路, 北門路, 青年路, 東門路, 開山路, 大同路).
    /// - Entering the roundabout starts a disorientation timer.
    /// - Smooth exit within 2.5s~10s at speed > 22 km/h earns "【圓環車神突破八卦陣！】" (+1000 PTS).
    /// - Circling for > 10s triggers "【台南圓環莫比烏斯迷路】" delay fine (-$300).
    /// </summary>
    public class TainanMobiusRoundaboutAI : MonoBehaviour
    {
        [Header("Roundabout Geometry")]
        [SerializeField] private Vector3 centerPosition = Vector3.zero;
        [SerializeField] private float innerRadius = 5.2f;
        [SerializeField] private float outerTrackRadius = 9.8f;
        [SerializeField] private float exitThreshold = 6.2f;

        [Header("State Tracking")]
        [SerializeField] private bool isActiveInScene = false;
        private float roundaboutTimer = 0f;
        private bool roundaboutAwarded = false;
        private float resetCooldown = 0f;

        public event Action<string, int> OnRoundaboutSuccess;
        public event Action<string, int> OnRoundaboutLostInLoop;

        public void SetRoundaboutActive(bool active)
        {
            isActiveInScene = active;
            gameObject.SetActive(active);
            if (!active)
            {
                roundaboutTimer = 0f;
                roundaboutAwarded = false;
            }
        }

        private void Update()
        {
            if (resetCooldown > 0f)
            {
                resetCooldown -= Time.deltaTime;
                if (resetCooldown <= 0f)
                {
                    roundaboutAwarded = false;
                    roundaboutTimer = 0f;
                }
            }
        }

        /// <summary>
        /// Update loop evaluated per frame by TrafficManager when in Tainan
        /// </summary>
        public void UpdatePlayerRoundabout(float dt, Vector3 playerPos, float speedKmH)
        {
            if (!isActiveInScene || resetCooldown > 0f) return;

            float distToCenter = Vector2.Distance(
                new Vector2(playerPos.x, playerPos.z),
                new Vector2(centerPosition.x, centerPosition.z)
            );

            // Inside roundabout active zone
            if (distToCenter < outerTrackRadius && distToCenter > innerRadius * 0.8f)
            {
                roundaboutTimer += dt;

                // Player successfully breaks out of the loop at high speed
                bool cuttingOut = Mathf.Abs(playerPos.x - centerPosition.x) > exitThreshold ||
                                  Mathf.Abs(playerPos.z - centerPosition.z) > exitThreshold;

                if (!roundaboutAwarded && roundaboutTimer > 2.5f && roundaboutTimer < 10.0f && speedKmH > 22f && cuttingOut)
                {
                    roundaboutAwarded = true;
                    resetCooldown = 14.0f;
                    OnRoundaboutSuccess?.Invoke("【圓環車神突破八卦陣！】順利切出！", 1000);
                }
                else if (!roundaboutAwarded && roundaboutTimer >= 10.0f)
                {
                    roundaboutAwarded = true;
                    resetCooldown = 14.0f;
                    OnRoundaboutLostInLoop?.Invoke("【台南圓環莫比烏斯迷路】 - 迷航耽擱！", 300);
                }
            }
            else
            {
                if (roundaboutTimer > 0f && !roundaboutAwarded)
                {
                    roundaboutTimer = 0f;
                }
            }
        }
    }
}
