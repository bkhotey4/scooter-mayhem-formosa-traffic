using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// PedestrianSanctuaryAI (行人地獄斑馬線行人系統)
    /// Simulates pedestrians crossing on Taiwanese zebra crosswalks.
    /// Enforces Taiwan's Pedestrian Priority traffic regulations:
    /// - Failing to yield within 3 meters at high speed triggers whistle, camera flash, and -$1200 fine.
    /// - Yielding nicely (< 5 km/h) triggers polite waving gesture and +800 PTS bonus!
    /// </summary>
    public class PedestrianSanctuaryAI : MonoBehaviour
    {
        public enum PedestrianType { UmbrellaAuntie, PushcartElder, ShibaDogUncle }

        [Header("Pedestrian Identity")]
        [SerializeField] private PedestrianType pedestrianType = PedestrianType.UmbrellaAuntie;
        [SerializeField] private float walkSpeed = 1.3f;
        [SerializeField] private float minCrossX = -5.0f;
        [SerializeField] private float maxCrossX = 5.0f;

        [Header("Rig & Animation Transforms")]
        [SerializeField] private Transform leftLegTransform;
        [SerializeField] private Transform rightLegTransform;
        [SerializeField] private Transform leftArmTransform;
        [SerializeField] private Transform rightArmTransform;
        [SerializeField] private GameObject umbrellaProp;
        [SerializeField] private GameObject pushcartProp;
        [SerializeField] private GameObject dogCompanionProp;

        [Header("Enforcement Settings")]
        [SerializeField] private float yieldDistanceThreshold = 3.2f;
        [SerializeField] private float speedViolationThreshold = 5.0f; // m/s (~18 km/h)
        [SerializeField] private int unyieldedFineAmount = 1200;
        [SerializeField] private int yieldedBonusScore = 800;

        private int walkDirection = 1;
        private float walkPhase = 0f;
        private float waveTimer = 0f;
        private bool hasFined = false;
        private bool hasRewarded = false;

        public event Action<string, int> OnViolationFine;
        public event Action<string, int> OnYieldRewarded;
        public event Action<int> OnHeatIncreased;

        private void Update()
        {
            float dt = Time.deltaTime;

            // 1. Walking animation
            walkPhase += dt * walkSpeed * 4.2f;
            if (leftLegTransform != null && rightLegTransform != null)
            {
                leftLegTransform.localRotation = Quaternion.Euler(Mathf.Sin(walkPhase) * 24f, 0f, 0f);
                rightLegTransform.localRotation = Quaternion.Euler(-Mathf.Sin(walkPhase) * 24f, 0f, 0f);
            }

            if (waveTimer > 0f)
            {
                waveTimer -= dt;
                if (rightArmTransform != null)
                {
                    rightArmTransform.localRotation = Quaternion.Euler(0f, 0f, 65f + Mathf.Sin(Time.time * 8f) * 15f);
                }
            }
            else if (leftArmTransform != null && rightArmTransform != null)
            {
                leftArmTransform.localRotation = Quaternion.Euler(-Mathf.Sin(walkPhase) * 18f, 0f, 0f);
                rightArmTransform.localRotation = Quaternion.Euler(Mathf.Sin(walkPhase) * 18f, 0f, 0f);
            }

            // 2. Crosswalk traversal
            Vector3 pos = transform.position;
            pos.x += walkDirection * walkSpeed * dt;

            if (pos.x > maxCrossX)
            {
                pos.x = maxCrossX;
                walkDirection = -1;
                transform.rotation = Quaternion.Euler(0f, 270f, 0f);
            }
            else if (pos.x < minCrossX)
            {
                pos.x = minCrossX;
                walkDirection = 1;
                transform.rotation = Quaternion.Euler(0f, 90f, 0f);
            }
            transform.position = pos;
        }

        public void CheckPlayerInteraction(Vector3 playerPos, float playerSpeedMs, bool isPlayerCrashed)
        {
            if (isPlayerCrashed) return;

            float dist = Vector3.Distance(transform.position, playerPos);

            // Direct Hit
            if (dist < 1.2f)
            {
                OnViolationFine?.Invoke("【重大交通違規：衝撞斑馬線行人！】", 2000);
                OnHeatIncreased?.Invoke(2);
                return;
            }

            // Failing to Yield within 3.2m at speed > 18 km/h
            if (!hasFined && dist < yieldDistanceThreshold && playerSpeedMs > speedViolationThreshold)
            {
                hasFined = true;
                OnViolationFine?.Invoke("【科技執法：未依規定停讓行人穿越道行人】", unyieldedFineAmount);
                OnHeatIncreased?.Invoke(1);
            }

            // Yielding Nicely before crosswalk (< 5 km/h)
            if (!hasRewarded && dist < yieldDistanceThreshold * 1.35f && dist > 1.4f && playerSpeedMs < 1.4f)
            {
                hasRewarded = true;
                waveTimer = 3.5f;
                OnYieldRewarded?.Invoke("【禮讓行人模範騎士】行人親切揮手致意！", yieldedBonusScore);
            }
        }
    }
}
