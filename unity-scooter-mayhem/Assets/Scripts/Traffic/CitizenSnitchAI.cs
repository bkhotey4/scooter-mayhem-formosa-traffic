using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Citizen Snitch NPC (檢舉魔人):
    /// Hides on sidewalk / behind transformer boxes with a DSLR camera.
    /// Snaps photos and issues fines if player drives onto sidewalks or red curb zones!
    /// </summary>
    public class CitizenSnitchAI : MonoBehaviour
    {
        [Header("Detection Specs")]
        [SerializeField] private float detectionRadius = 12f;
        [SerializeField] private int fineAmount = 200;
        [SerializeField] private Light cameraFlashLight;
        [SerializeField] private AudioSource shutterAudio;

        private Transform playerTransform;
        private Vehicle.ScooterVehicleController playerController;
        private bool isTriggered = false;

        public event Action<string, int> OnSnitchTicketIssued;

        private void Start()
        {
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                playerTransform = player.transform;
                playerController = player.GetComponent<Vehicle.ScooterVehicleController>();
            }
        }

        private void Update()
        {
            if (playerTransform == null || playerController == null) return;

            float dist = Vector3.Distance(transform.position, playerTransform.position);

            if (dist < detectionRadius)
            {
                // Check if player is on sidewalk (X offset outside road boundary > 6.8m)
                bool isOnSidewalk = Mathf.Abs(playerTransform.position.x) > 6.8f;

                if (isOnSidewalk && !isTriggered && playerController.CurrentSpeedKmH > 10f)
                {
                    isTriggered = true;
                    TriggerFlash();
                    OnSnitchTicketIssued?.Invoke("【檢舉魔人】違規行駛人行道", fineAmount);
                }
            }
            else if (dist > 25f)
            {
                isTriggered = false;
            }
        }

        private void TriggerFlash()
        {
            if (shutterAudio != null) shutterAudio.Play();
            if (cameraFlashLight != null)
            {
                cameraFlashLight.enabled = true;
                Invoke(nameof(TurnOffFlash), 0.15f);
            }
        }

        private void TurnOffFlash()
        {
            if (cameraFlashLight != null) cameraFlashLight.enabled = false;
        }
    }
}
